require('dotenv').config();

const express = require('express');
const app = express();

// if PORT in the .env is not set, PORT defaults to 3000
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html');
});

// Simplified route for the legal information page
app.get('/legal', (req, res) => {
    res.sendFile(__dirname + '/public/legal.html');
});

// Simplified route for the 404 page
app.get('/404', (req, res) => {
    res.sendFile(__dirname + '/public/404.html');
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
