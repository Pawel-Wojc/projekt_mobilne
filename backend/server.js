// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const webPush = require('web-push');
const app = express();
const PORT = 3000;

app.use(cors());

// read config
const CONFIG = require('./config.json');

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
            p256dh: String,
        },
    },
});
const PushSubscription = mongoose.model(
    'pushSubscription',
    pushSubscriptionSchema
);
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

app.post('/api/addRecord', async (req, res) => {
    const { userId, date, value, desc } = req.body;
    if (!userId || !date || !value) {
        return res.status(400).json({ message: 'Niepełne dane' });
    }
    try {
        const newRecord = new FinanceRecord({
            userId,
            date: new Date(date),
            value,
            desc,
        });
        await newRecord.save();
        res.status(201).json({ message: 'Dodano nowy rekord finansowy.' });
    } catch (error) {
        console.error('Błąd podczas dodawania rekordu:', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas dodawania rekordu.',
        });
    }
});

app.get('/api/get-trasnactions', async (req, res) => {
    const { userId, pageNumber } = req.query;
    const pageSize = 20;
    const skip = (pageNumber - 1) * pageSize;

    try {
        const records = await FinanceRecord.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

        const totalRecords = await FinanceRecord.countDocuments({ userId });

        res.json({
            records,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalRecords / pageSize),
            totalRecords
        });
    } catch (error) {
        console.error('Wystąpił błąd podczas wczytywania historii transakcji', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas wczytywania historii transakcji.',
        });
    }
});

// save  users push subscription
app.post('/api/save-push-sub', async (req, res) => {
    const userId = req.get('userId');
    const { endpoint, keys } = req.body;
    console.log('User ID:', userId);
    console.log('Endpoint:', endpoint);
    console.log('Auth:', keys);
    console.log('p256dh:', keys?.p256dh);
    try {
        let pushSub = await PushSubscription.findOne({ userId });

        if (pushSub) {
            await PushSubscription.deleteOne({ userId });
        }

        const userSub = new PushSubscription({
            userId,
            subscription: {
                endpoint,
                keys,
            },
        });

        await userSub.save();
        res.status(201).json({ message: 'Subskrypcja zapisana.' });
    } catch (error) {
        console.error('Błąd podczas zapisywania subskrypcji push', error);
        res.status(500).json({
            message: 'Wystąpił błąd podczas zapisywania subskrypcji push.',
        });
    }
});

app.get('/send/push', async(req, res) =>{
    const userId = '6828bb643b7ac99f5ff4a338';
    let pushSub = await PushSubscription.findOne({userId}); 
    const pushSubscription = pushSub.subscription;
    webPush.setVapidDetails(
    'https://yourdomain.org',  // Using a URL instead of mailto
    CONFIG.VAPID_public_key,
    CONFIG.VAPID_private_key
    );
    const payload = JSON.stringify({ title: 'Hello!', body: 'Hello, world!' });
    webPush.sendNotification(pushSubscription, payload)
    .then(result => console.log('Push sent:', result))
    .catch(err => console.error('Error sending push:', err));
});

// Start serwera
app.listen(PORT, () => {
    // console.log(`process.env.PORT: ${process.env.PORT}`);
    console.log(`Serwer nasłuchuje na porcie ${PORT}.`);
});
