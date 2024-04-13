import express from 'express'
import { logger } from './middlewares/logger.js'
import dotenv from 'dotenv'
// for form handling
import fs from 'fs'
import path from 'path'
// for body parser
import { json, urlencoded } from 'express'


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

// use built-in express body-parser middleware
app.use(json())
app.use(urlencoded({ extended: true }))

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

// route for posting a blog entry
app.post('submit-blog', (req, res) => {
    // to use body-parser middleware to parse form data
    const { title, content } = req.body

    // where the blog entry will be stored locally
    const blogsPath = path.join(__dirname, 'blogs.json')

    // read existing blog entries
    fs.readFile(blogsPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Eorr reading blog entries')
        }

        // parse existing blog entries
        let blogs = []
        if (data) {
            blogs = JSON.parse(data)
        }

        // add the new blog entry
        blogs.push({ title, content })

        // write the updated blog entries back to the file
        fs.writeFile(blogsPath, JSON.stringify(blogs, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err)
                return res.status(500).send('Error saving blog entry')
            }

            // redirect user to either a success page or back to the form
            res.redirect('/blog-entry')
        })
    })
})


// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html')
})

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
