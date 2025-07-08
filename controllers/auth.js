//THis is where all the auth logic is dumped man!
const User= require("../models/user.js")
const crypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
const generateToken = require("../utils/jwt.js")

//signup conroller
const signup=async (req,res) => {
    try{
        const {role,name,email,password,location}= req.body;
        if(!role || !name || !email || !password || !location){
            throw new Error("All fields are required")
            
        }
        const user= await User.findOne({email:email})
        
        if(user){
            throw new Error("Your email is already used")
        }

        const salt = await crypt.genSalt(10)
        const hashedPassword = await crypt.hash(password,salt)

        const newUser = new User({
            role,
            name,
            email,
            password:hashedPassword,
            location

        })
        if(!newUser){
            throw new Error("Database issue")
        }

        await newUser.save()

        const token = await generateToken(newUser._id,newUser.email,newUser.role);

        res.status(200).json({
            User:newUser,
            token,
        })



    }catch(e){
        res.status(500).json(e.message)
    }
}


//login controller
const login=async (req,res) => {
    try{
        const {email,password}= req.body;
        if(!email || !password){
            throw new Error("All fields are required")
            
        }
        const user= await User.findOne({email,})

        if(!user){
            throw new Error("This email does not exist")
        }

        const match = await crypt.compare(password,user.password)
        if(!match){
            throw new Error("Incorrect password")
        }
        
        res.status(200).json({
            message:"Surprsingly so it worked",
            User:user,
            token:await generateToken(user._id,user.email,user.role)
        })
    

    }catch(e){
        res.status(500).json(e.message)
    }
}

module.exports={signup,login}