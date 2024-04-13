import express from 'express'
import { logger } from './middlewares/logger.js'
import dotenv from 'dotenv'
dotenv.config()

// require('dotenv').config()

// const express = require('express')
const app = express()


// if PORT in the .env is not set, PORT defaults to 3000
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

// add logger functionality
app.use(logger)

// Route for the home page
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html')
// })
app.get('/', (req, res) => {
    res.render('index')
    console.log('rendering ejs index')
})


app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html')
})

// route for the legal information page
app.get('/legal', (req, res) => {
    res.sendFile(__dirname + '/public/legal.html')
})

// route for the 404 page
app.get('/404', (req, res) => {
    res.sendFile(__dirname + '/public/404.html')
})

// TEST ROUTE
app.get('/test', (req, res) => {
    res.send('Test route')
})

// blog entry, initially for local storage of entered data
app.get('/blog-entry', (req, res) => {
    res.sendFile(__dirname + '/public/blog-entry.html')
})


// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html')
})

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
