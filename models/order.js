//order model

const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    type:{type:String,enum:["order","farminput"]},
    product:{type:mongoose.Schema.Types.ObjectId, ref: 'Product'},
    buyer:{type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    farmer:{type: mongoose.Schema.Types.ObjectId,required:true, ref: 'User' },
    inc:{type:"String"},
    farminput:{type:"String"},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    status:{type:String,required:true,enum:["pending","accepted","rejected","delivered","paid"],default:"pending"},
    transport:{type:String},
    transporting:{type:Boolean,default:false},
    dateJoined:{type:Date,default:Date.now()},

})

const Orders = mongoose.model("Orders", orderSchema)

module.exports = Orders