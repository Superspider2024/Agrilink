//This is where all the profile management logic is dumped

const User = require("../models/user.js")

//to get own user's details
const getMe= async(req,res)=>{
    try{
        const user= req.user;
        if(!user){
            throw new Error("User not found")
        }
        res.status(200).json(user)

    }catch(e){
        res.status(500).json(e.message)
    
    }
}

//get a profile's details of another user if u have ID
const profile= async(req,res)=>{
    try{
        const id=req.params.id;
        const user= await User.findById(id);
        if(!user){
            throw new Error("User not found")
        }

        res.status(200).json(user)

    }catch(e){
        res.status(500).json(e.message)
    
    }
}

//update your own user's details
const updateProfile= async(req,res)=>{
    try{
        const user=req.user;

        if(!user){
            throw new Error("User not found")
        }
        const {name,location}=req.body;
        if(!name || !location){
            throw new Error("All fields are required")
        }
        const newUser= await User.findByIdAndUpdate(user._id,{
            name,
            location
        },{new:true,runValidators:true,}).select('-password')
        if(!newUser){
            throw new Error("User not updated")
        }
        await newUser.save()
        res.status(200).json(newUser)
        
    }catch(e){
        res.status(500).json(e.message)
    
    }
}

const users= async(req,res)=>{
    try{
        const users = await User.find();
        if(!users){
            throw new Error("Issue with server or database")
        }

        res.status(200).json(users)
    }catch(e){
        res.status(500).json(e.message)
    }
}


module.exports={getMe,profile,updateProfile,users}  