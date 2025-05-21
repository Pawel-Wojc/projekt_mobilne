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
// Def user subscription for push msg
const pushSubscriptionSchema = new mongoose.Schema({
    userId: String,
    subscription: {
        endpoint: String,
        keys: {
            auth: String,
            p256dh: String
        }
    }
});
const PushSubscription = mongoose.model('pushSubscription', pushSubscriptionSchema);
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
        if (!existingUser || existingUser.password !== password) {
            return res.status(400).json({ message: 'Błędne dane logowania' });
        }

        res.status(202).json({ message: existingUser._id.toString() });
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas logowania.' });
    }
});

// save  users push subscription
app.post('/api/save-push-sub', async(req, res) =>{
    const userId = req.get('userId');
    const { endpoint, keys } = req.body;
    console.log('User ID:', userId);
    console.log('Endpoint:', endpoint);
    console.log('Auth:', keys
    );
    console.log('p256dh:', keys?.p256dh);
    try {
        let pushSub = await PushSubscription.findOne({userId}); 
        
        if(pushSub){
            await PushSubscription.deleteOne({userId}); 
        }
        
        const userSub = new PushSubscription({ 
            userId, 
            subscription: {
                endpoint,
                keys
            }
        });

        await userSub.save();
        res.status(201).json({ message: 'Subskrypcja zapisana.' });
    } catch (error) {
        console.error('Błąd podczas zapisywania subskrypcji push', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania subskrypcji push.' });
    }
});

app.get('/api/summary/:currentUser', async (req, res) => {
    const currentUser = req.params.currentUser;
    if (!currentUser) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const userRecords = await FinanceRecord.find({ userId: currentUser });
        res.status(200).json(userRecords);
    } catch (error) {
        console.error('Błąd podczas pobierania podsumowania:', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas pobierania podsumowania.',
        });
    }
});

app.get('/api/summary/:currentUser', async (req, res) => {
    const currentUser = req.params.currentUser;
    if (!currentUser) {
        return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
    }

    try {
        const userRecords = await FinanceRecord.find({ userId: currentUser });
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
