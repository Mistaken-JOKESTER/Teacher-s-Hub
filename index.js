require('dotenv').config()

const https = require('https')
const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')


const mainRouter = require('./Routers/router')
const pool = require('./DatabaseFunctions/dbconnection')
const sessionConfig = require('./sessionSetup/sessionConfig')

const fs = require('fs')
const path = require('path')

const app = express()
const cors = require('cors')
app.use(cors())
//Json parser for reading post request data
app.use(cookieParser())

app.use(session(sessionConfig))
app.use(flash())

//Json parser for reading post request data
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });
  

app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(__dirname + '/views/public'))

app.use('/', mainRouter)

const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, "/ssl/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, '/ssl/cert.pem'))
}, app)

server.listen(3000, process.env.SERVER_HOST, () => {
    console.log("API is running on port", 3000)
})