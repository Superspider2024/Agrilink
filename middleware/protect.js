//the main authentication and authorzation middleware

const jwt= require("jsonwebtoken")
require("dotenv").config()
const verify= require("../utils/verify.js")
const express= require("express")
const split= require("../utils/authsplit.js")
const User= require("../models/user.js")

//Checks if JWT is valid
const protect=async(req,res,next)=>{
    try{
    const lol=await verify(req,res)
    if(!lol){
        throw new Error("Issue with security!")
    }
    req.user=await User.findOne({email:lol.email})
    if(!req.user){
        throw new Error("Issue connecting user to server...")
    }
    next()
    }catch(e){
        res.status(401).json("ERROR: "+ e.message)
    }
}

module.exports=protect