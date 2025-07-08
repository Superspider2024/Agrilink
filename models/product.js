//product model

const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true },
    location:{type:String, required:true},
    farmer:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateJoined:{type:Date,default:Date.now()}
})

const Products = mongoose.model("Products", productSchema)

module.exports = Products;