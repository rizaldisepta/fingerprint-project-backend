const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL connection
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
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
// API endpoint to register email and fingerprint
app.post('/api/register', (req, res) => {
    // Extract email and fingerprint ID from the request body
    const { email, fingerprint } = req.body;

    // Check if email and fingerprint ID are present in the request body
    if (!email) {
        return res.status(400).send('Email is required');
    }

    // Insert the email and fingerprint ID into the database
    const query = 'INSERT INTO users (email, fingerprint_id) VALUES (?, ?)';
    db.query(query, [email, fingerprint], (err, result) => {
        if (err) {
            console.error('Error inserting email and fingerprint:', err);
            return res.status(500).send('Error registering email and fingerprint');
        }
        res.status(200).send('Email and fingerprint registered successfully');
    });
});


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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
