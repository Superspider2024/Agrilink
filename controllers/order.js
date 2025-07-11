//Both the product management logic and ofer logic is dumped
const User= require("../models/user.js")
const crypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
require("dotenv").config()
const Products = require("../models/product.js")
const Orders = require("../models/order.js")

//Conroller to create an offer
const createOffer = async(req,res)=>{
    try{
        const{farmerId,productId,price, quantity}=req.body;
        if(!farmerId || !productId || !price || !quantity){
            throw new Error("All fields are required")
        }
        const product= await Products.findById(productId)
        if(!product){
            throw new Error("Product not found")
        }
        const newOrder = await new Orders({
            product:productId,
            buyer:req.user._id,
            farmer:farmerId,
            price,
            quantity
        })
        if(!newOrder){
            throw new Error("Order not created")
        }
        await newOrder.save()
        res.status(200).json(newOrder)
        
    }catch(e){
        res.status(500).json(e.message)
    }
}

//get all orders
const orders = async(req,res)=>{
    try{
        const orders = await Orders.find({buyer:req.user._id})
        if(!orders){
            throw new Error("Orders not found")
        }
        res.status(200).json(orders)
    }
    catch(e){
        res.status(500).json(e.message)
    }
}

//get an order
const order = async(req,res)=>{
    try{
        const id=req.params.id;
        const order = await Orders.findById(id)
        if(!order){
            throw new Error("Order not found")
        }
        res.status(200).json(order)
    }catch(e){
        res.status(500).json(e.message)
    }
}

//update order
const updateOrder = async(req,res)=>{
    try{
        const id=req.params.id;
        const {status,price,quantity  }=req.body;
        const order = await Orders.findByIdAndUpdate(id,{
            status,
            price,
            quantity
        })
        await order.save()
        res.status(200).json(order)
    }catch(e){
        res.status(500).json(e.message)
    }
}

//delete an order
const deleteOrder = async(req,res)=>{
    try{
        const id=req.params.id;
        const order = await Orders.findByIdAndDelete(id)
        if(!order){
            throw new Error("Order not found")
        }
        res.status(201).json("Deleted!")
    }catch(e){
        res.status(500).json(e.message)
    }
}

//accept an offer
const acceptOffer= async(req,res)=>{
    try{
        const id=req.params.id;
        const order = await Orders.findByIdAndUpdate(id,{
            status:"accepted"
        })
        if(!order){
            throw new Error("Order not found")
        }
        await order.save()       
        res.status(201).json(order)
    }catch(e){
        res.status(500).json(e.message)
    }
}

//decline offer
const declineOffer= async(req,res)=>{
    try{
        const id=req.params.id;
        const order = await Orders.findByIdAndUpdate(id,{
            status:"rejected"
        })
        if(!order){
            throw new Error("Order not found")
        }       
        await order.save()
        res.status(201).json(order)
    }catch(e){
        res.status(500).json(e.message)
    }
}

const offers= async(req,res)=>{
    try{
        const orders = await Orders.find({farmer:req.user._id})
        if(!orders){
            throw new Error("Orders not found")
        }
        res.status(200).json(orders)
    }catch(e){
        res.status(500).json(e.message)
    }
}

const transport = async(req,res)=>{
    try{
        const {transport,id} = req.body;
        if(!transport || !id){
            throw new Error("Lack of enough input")
        }
        const order= await Orders.findByIdAndUpdate(id,{
            transport,
            transporting:true,
            status:"paid"
        },{new:true})

        await order.save()
        res.status(201).json(order)
    }catch(e){
        res.status(500).json(e.message)
    }
}


module.exports={declineOffer,transport,acceptOffer,createOffer,orders,order,updateOrder,deleteOrder,offers}