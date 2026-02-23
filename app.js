const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const auth = require('./routes/auth.js')
const product = require('./routes/product.js')
const connect = require('./config/db.js')
const http = require('http')
const bodyParser = require('body-parser');




app.use(express.urlencoded({ extended: true }))



connect()
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/auth',auth)
app.use('/api',product)
const PORT = process.env.PORT || 3000;

app.use('/', (req,res)=>{
    res.send('Welcome to Agrilink Backend');
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//http://localhost:3000
