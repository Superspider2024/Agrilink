const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const auth = require('./routes/auth.js')
const product = require('./routes/product.js')
const ussd = require('./routes/ussd.js')
const connect = require('./config/db.js')
const { Server } = require('socket.io')
const socketHandler = require('./sockets/io.js')
const http = require('http')
const bodyParser = require('body-parser');



app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const server = http.createServer(app); 


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

connect()
app.use(express.json());
app.use(cors())
app.use('/ussd', ussd);
app.use('/auth',auth)
app.use('/api',product)
const PORT = process.env.PORT || 3000;

app.use('/', (req,res)=>{
    res.send('Welcome to Agrilink Backend');
})

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//http://localhost:3000
