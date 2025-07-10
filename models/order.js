//order model

const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    product:{type:mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    buyer:{type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    farmer:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    status:{type:String,required:true,enum:["pending","accepted","rejected","delivered"],default:"pending"},
    transport:{type:String},
    transporting:{type:Boolean,default:false},
    dateJoined:{type:Date,default:Date.now()},

})

const Orders = mongoose.model("Orders", orderSchema)

module.exports = Orders