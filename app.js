const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const mongoose = require('mongoose')
const { config } = require('dotenv')
const cors = require('cors')

config()
const app = express();
const VERSION = "/api/v1";

app
    .use(cors())
    .use(bodyParser.json())


mongoose.connect(process.env.MONGODB_URI).then(() => {  
    console.log("Database connected")
})