const connectToMongo = require('./db')
const express = require('express');
const { request } = require('express');
const path = require('path')
const cors = require('cors')

connectToMongo()
const app = express()
const Port = 5000;

// middlewares
app.use(cors())
app.use(express.json())

// available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// static files
app.use(express.static(path.join(__dirname, './client/build')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})

app.get('/', (req, res) => {
    res.send("Hello this is home page!")
})

app.listen(Port, () => {
    console.log(`The app is running on the port ${Port}`)
})