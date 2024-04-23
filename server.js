import express from 'express'
import { logger } from './middlewares/logger.js'
import dotenv from 'dotenv'
// for form handling
import fs from 'fs'
import path from 'path'
// for body parser
import { json, urlencoded } from 'express'

// modules to make __dirname work with import
import { fileURLToPath } from 'url'
import { dirname } from 'path'

dotenv.config()

// require('dotenv').config()

// const express = require('express')
const app = express()

// if PORT in the .env is not set, PORT defaults to 3000
const PORT = process.env.PORT || 3000

// get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))

// add logger functionality
app.use(logger)

// use built-in express body-parser middleware
app.use(json())
app.use(urlencoded({ extended: true }))

// Route for the home page
// -------
// with res.sendFile it uses index.html, with res.render, it uses index.ejs
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html')
// })
app.get('/', (req, res) => {
    res.render('index')
    console.log('rendering ejs index')
})


app.get('/contact', (req, res) => {
    // res.sendFile(__dirname + '/public/contact.html')
    res.render('contact')
})

// route for the legal information page
app.get('/legal', (req, res) => {
    // res.sendFile(__dirname + '/public/legal.html')
    res.render('legal')
})

// route for the 404 page
app.get('/404', (req, res) => {
    // res.sendFile(__dirname + '/public/404.html')
    res.render('404')
})

// TEST ROUTE
app.get('/test', (req, res) => {
    res.send('Test route')
})

// blog entry, initially for local storage of entered data
app.get('/blog-entry', (req, res) => {
    // res.sendFile(__dirname + '/public/blog-entry.html')
    res.render('blog-entry')
})

// route for posting a blog entry
app.post('/submit-blog', (req, res) => {

    // to use body-parser middleware to parse form data
    const { title, content } = req.body

    // where the blog entry will be stored locally
    const blogsPath = path.join(__dirname, 'blogs.json')

    // read existing blog entries
    fs.readFile(blogsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading blog entries:', err)
            return res.status(500).send('Error reading blog entries')
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

// trivial first route for displaying all blog entries
app.get('/blogs', (req, res) => {

    // where the blog entry is stored locally
    const blogsPath = path.join(__dirname, 'blogs.json')

    function getBlogs() {
        const data = fs.readFileSync(blogsPath, 'utf8')
        return JSON.parse(data)
    }

    const blogs = getBlogs()
    res.render('blogs', {blogs: blogs})
})

// captures the index of the blog entry and renders an edit page with the blog data prepopulated
app.get('/edit-blog/:index', (req, res) => {
    const index = req.params.index
    const blogsPath = path.join(__dirname, 'blogs.json')
    const data = fs.readFileSync(blogsPath, 'utf8')
    const blogs = JSON.parse(data)

    if (index >= 0 && index < blogs.length) {
        res.render('edit-blog-entry', { blog: blogs[index], index: index })
    } else {
        res.status(404).send('Blog not found')
    }
})

// handles form submission from the edit page
app.post('/update-blog/:index', (req, res) => {
    const index = req.params.index
    const { content } = req.body
    const blogsPath = path.join(__dirname, 'blogs.json')
    const data = fs.readFileSync(blogsPath, 'utf8')
    let blogs = JSON.parse(data)

    if (index >= 0 && index < blogs.length) {
        blogs[index].content = content // Update the content
        fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf8')
        res.redirect('/blogs')
    } else {
        res.status(404).send('Blog not found')
    }
})

app.post('/delete-blog/:index', (req, res) => {
    const index = parseInt(req.params.index)
    const blogsPath = path.join(__dirname, 'blogs.json')
    const data = fs.readFileSync(blogsPath, 'utf8')
    let blogs = JSON.parse(data)
    
    if (index >= 0 && index < blogs.length) {
        blogs.splice(index, 1); // Remove the blog entry
        fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf8');
        res.redirect('/blogs');
    } else {
        res.status(404).send('Blog not found');
    }
});


// Catch-all route for handling 404 errors
app.use((req, res) => {
    // res.status(404).sendFile(__dirname + '/public/404.html')
    res.status(404).render('404')

})

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
