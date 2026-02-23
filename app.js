const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const auth = require('./routes/auth.js')
const product = require('./routes/product.js')
const connect = require('./config/db.js')
const http = require('http')
const bodyParser = require('body-parser');
const orderRoutes = require('./routes/order.js');
const { getProducts, createProduct, porterAddFarmer, getMyDepotFarmers, verifyAndLock } = require("../controllers/product");
const Orders = require("../models/order"); 
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

// The Marketplace Routes (The missing front doors)
router.get("/", getProducts); // Anyone can view products
router.post("/", protect, authorize(["farmer", "mansart"]), createProduct); // Only farmers/mansarts can list



app.use(express.urlencoded({ extended: true }))



connect()
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/auth',auth)
app.use('/api',product)
app.use('/orders', orderRoutes);
const PORT = process.env.PORT || 3000;

app.use('/', (req,res)=>{
    res.send('Welcome to Agrilink Backend');
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//http://localhost:3000
