//the authorization middleware

const User= require("../models/user.js")



//authorizes onl farmers
const authorizeFarmer=async(req,res,next)=>{
    try{
        if(req.user.role !== "farmer"){
            throw new Error("Wrong role!")
        }
    next()
    }catch(e){
        res.status(401).json("ERROR: "+ e.message)
    }
}

//authorizes only buyers
const authorizeBuyer=async(req,res,next)=>{
    try{
        if(req.user.role !== "buyer"){
            throw new Error("Wrong role!")
        }
    next()
    }catch(e){
        res.status(401).json("ERROR: "+ e.message)
    }
}

module.exports={authorizeFarmer,authorizeBuyer}