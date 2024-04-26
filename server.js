import express from 'express'
import { logger } from './middlewares/logger.js'
import { MongoClient } from 'mongodb'
import { ObjectId } from 'mongodb'
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


// (REMOTE) connection string to mongodb atlas using env variables for security
const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qiwmyxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })

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

// test route
app.get('/test', (req, res) => {
    res.send('Test route')
})

// blog entry, initially for local storage of entered data
app.get('/blog-entry', (req, res) => {
    // res.sendFile(__dirname + '/public/blog-entry.html')
    res.render('blog-entry')
})

// A LOCAL STORAGE ROUTE
// route for posting a blog entry
// app.post('/submit-blog', (req, res) => {

//     // to use body-parser middleware to parse form data
//     const { title, content } = req.body
//     // where the blog entry will be stored locally
//     const blogsPath = path.join(__dirname, 'blogs.json')
//     // read existing blog entries
//     fs.readFile(blogsPath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading blog entries:', err)
//             return res.status(500).send('Error reading blog entries')
//         }
//         // parse existing blog entries
//         let blogs = []
//         if (data) {
//             blogs = JSON.parse(data)
//         }
//         // add the new blog entry
//         blogs.push({ title, content })
//         // write the updated blog entries back to the file
//         fs.writeFile(blogsPath, JSON.stringify(blogs, null, 2), 'utf8', (err) => {
//             if (err) {
//                 console.error(err)
//                 return res.status(500).send('Error saving blog entry')
//             }
//             // redirect user to either a success page or back to the form
//             res.redirect('/blog-entry')
//         })
//     })
// })

// (REMOTE) REMOTE ATLASDB STORAGE ROUTE  -- C (CREATE) of CRUD
app.post('/submit-blog', async (req, res) => {
    const { title, content } = req.body;
    try {
      await client.connect();
      const db = client.db('blogdb');
      const collection = db.collection('blogs')
      await collection.insertOne({ title, content })
      res.redirect('/blog-entry')
    } catch (err) {
      console.error(err)
      res.status(500).send('Error saving blog entry')
    } finally {
      await client.close()
    }
  })

// (REMOTE) CLOSE MONGODB CLIENT CONNECTION BEFORE NODE APP EXITS
process.on('SIGINT', async () => {
    try {
      await client.close()
      console.log('MongoDB connection closed')
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })


// (LOCAL) ROUTE FOR DISPLAY OF LOCALLY STORED BLOG ENTRIES
// trivial first route for displaying all blog entries
// app.get('/blogs', (req, res) => {

//     // where the blog entry is stored locally
//     const blogsPath = path.join(__dirname, 'blogs.json')

//     function getBlogs() {
//         const data = fs.readFileSync(blogsPath, 'utf8')
//         return JSON.parse(data)
//     }

//     const blogs = getBlogs()
//     res.render('blogs', {blogs: blogs})
// })

// (REMOTE) DISPLAY REMOTELY STORED BLOG ENTRIES -- R (READ) of CRUD
app.get('/blogs', async (req, res) => {
    try {
      await client.connect()
      const db = client.db('blogdb')
      const collection = db.collection('blogs')
      const blogs = await collection.find().toArray()
      res.render('blogs', { blogs: blogs })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error retrieving blog entries')
    } finally {
      await client.close()
    }
  })

// captures the index of the blog entry and renders an edit page with the blog data prepopulated
// app.get('/edit-blog/:index', (req, res) => {
//     const index = req.params.index
//     const blogsPath = path.join(__dirname, 'blogs.json')
//     const data = fs.readFileSync(blogsPath, 'utf8')
//     const blogs = JSON.parse(data)

//     if (index >= 0 && index < blogs.length) {
//         res.render('edit-blog-entry', { blog: blogs[index], index: index })
//     } else {
//         res.status(404).send('Blog not found')
//     }
// })

// (REMOTE) DISPLAY REMOTELY STORED BLOG ENTRIES -- U (UPDATE 1/2) of CRUD

// app.get('/edit-blog/:id', async (req, res) => {
//     const id = req.params.id;
//     try {
//       await client.connect();
//       const db = client.db('blogdb');
//       const collection = db.collection('blogs');
//       const blog = await collection.findOne({ _id: new ObjectId(id) });
//       if (blog) {
//         res.render('edit-blog', { blog: blog });
//       } else {
//         res.status(404).send('Blog not found');
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error retrieving blog entry');
//     } finally {
//       await client.close();
//     }
//   });

app.post('/edit-blog/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    try {
      await client.connect();
      const db = client.db('blogdb');
      const collection = db.collection('blogs');
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title, content } });
      res.redirect('/blogs');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating blog entry');
    } finally {
      await client.close();
    }
  });



// handles form submission from the edit page
// app.post('/update-blog/:index', (req, res) => {
//     const index = req.params.index
//     const { content } = req.body
//     const blogsPath = path.join(__dirname, 'blogs.json')
//     const data = fs.readFileSync(blogsPath, 'utf8')
//     let blogs = JSON.parse(data)

//     if (index >= 0 && index < blogs.length) {
//         blogs[index].content = content // Update the content
//         fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf8')
//         res.redirect('/blogs')
//     } else {
//         res.status(404).send('Blog not found')
//     }
// })

// (REMOTE) EDIT A BLOG ENTRY -- U (UPDATE 2/2) of CRUD


// app.get('/edit-blog/:index', async (req, res) => {
//     const index = req.params.index
//     try {
//       await client.connect()
//       const db = client.db('blogdb')
//       const collection = db.collection('blogs')
//       const blog = await collection.findOne({ _id: new ObjectId(index) })
//       if (blog) {
//         res.render('edit-blog', { blog: blog })
//       } else {
//         res.status(404).send('Blog not found')
//       }
//     } catch (err) {
//       console.error(err)
//       res.status(500).send('Error retrieving blog entry')
//     } finally {
//       await client.close()
//     }
//   });

app.get('/edit-blog/:id', async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    try {
      await client.connect();
      const db = client.db('blogdb');
      const collection = db.collection('blogs');
      const blog = await collection.findOne({ _id: new ObjectId(id) });
      if (blog) {
        res.render('edit-blog', { blog: blog });
      } else {
        res.status(404).send('Blog not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving blog entry');
    } finally {
      await client.close();
    }
  });


app.post('/delete-blog/:index', (req, res) => {
    const index = parseInt(req.params.index)
    const blogsPath = path.join(__dirname, 'blogs.json')
    const data = fs.readFileSync(blogsPath, 'utf8')
    let blogs = JSON.parse(data)

    if (index >= 0 && index < blogs.length) {
        blogs.splice(index, 1); // Remove the blog entry
        fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf8')
        res.redirect('/blogs')
    } else {
        res.status(404).send('Blog not found')
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
