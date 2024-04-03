const express = require('express')
const app = express()

// if PORT in the .env is not set, PORT defaults to 3000
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})