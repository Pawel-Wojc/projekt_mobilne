// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());

// read config
const CONFIG = require('../config.json');

// Połączenie z bazą danych MongoDB
mongoose.connect(CONFIG.mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Błąd połączenia z MongoDB:'));
db.once('open', () => {
    console.log('Połączono z bazą danych MongoDB.');
});

// Definicja schematu użytkownika
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const transactionSchema = new mongoose.Schema({
    userId: String,
    date: Date,
    value: Number,
    desc: String,
});

const User = mongoose.model('User', userSchema);
const FinanceRecord = mongoose.model('FinanceRecord', transactionSchema);

app.use(bodyParser.json());

// Dodaj nowego użytkownika
app.post('/api/register', async (req, res) => {
    let { username, password } = req.body;
    // hashing password
    password = crypto
        .createHash('sha256', password)
        .update(CONFIG.salt)
        .digest('base64');

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res
                .status(400)
                .json({ message: 'Użytkownik już istnieje.' });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Utworzono nowego użytkownika.' });
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas tworzenia użytkownika.',
        });
    }
});

app.post('/api/login', async (req, res) => {
    let username = req.get('username');
    let password = req.get('password');
    // hashing password
    password = crypto
        .createHash('sha256', password)
        .update(CONFIG.salt)
        .digest('base64');

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser.password !== password) {
            return res.status(400).json({ message: 'Błędne dane logowania' });
        }

        res.status(202).json({ message: existingUser._id.toString() });
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas logowania.' });
    }
});

app.get('/api/summary', async (req, res) => {
    const userKey = req.query.userKey;
    if (!userKey) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const userRecords = await FinanceRecord.find({ userId: userKey });
        res.status(200).json(userRecords);
    } catch (error) {
        console.error('Błąd podczas pobierania podsumowania:', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas pobierania podsumowania.',
        });
    }
});

// Start serwera
app.listen(PORT, () => {
    // console.log(`process.env.PORT: ${process.env.PORT}`);
    console.log(`Serwer nasłuchuje na porcie ${PORT}.`);
});
