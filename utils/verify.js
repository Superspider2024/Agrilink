const jwt= require("jsonwebtoken")
require("dotenv").config()
const express= require('express')
const split= require("../utils/authsplit.js")

//verifies a JWT token
const verify= async(req,res)=>{
    try{
    const bro=split(req)
    if(!bro){
        throw new Error("Lacks JWT key!")
        }
    const decoded=jwt.verify(bro,process.env.SECRET)
    if(decoded){
    return decoded
    }else{
        throw new Error("Invalid token!")
    }
    }catch(e){
        throw new Error(e.message)
    }

}

module.exports=verify