//user model

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true,lowercase:true},
    password:{type:String, required:true},
    location:{type:String, required:true},
    chats:{type:Array,trim:true, lowercase:true},
    role:{type:String, required:true,enum:["farmer","buyer"]},
    dateJoined:{type:Date,default:Date.now()},
    
})

const User = mongoose.model("User", userSchema)

module.exports = User;
