const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

// MySQL connection
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Serve Angular build files
app.use(express.static(path.join(__dirname, 'dist/fingerprint-project')));

// API endpoint to register email
app.post('/api/register', (req, res) => {
    const email = req.body.email;
    const query = 'INSERT INTO users (email) VALUES (?)';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error inserting email:', err);
            res.status(500).send('Error registering email');
            return;
        }
        res.status(200).send('Email registered successfully');
    });
});

// API endpoint to check registration
app.post('/api/check', (req, res) => {
    const email = req.body.email;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            res.status(500).send('Error checking email');
            return;
        }
        if (results.length > 0) {
            res.status(200).send(`Email ${email} is registered`);
        } else {
            res.status(404).send(`Email ${email} is not registered`);
        }
    });
});

// Redirect all requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/fingerprint-project/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
