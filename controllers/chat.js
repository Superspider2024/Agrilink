const Chats= require("../models/chats.js")
const Messages= require("../models/messages.js")
const User= require("../models/user.js")




const addChat=async(req,res)=>{
    try{
        const {id}= req.body;

        if(id===req.user._id){
            return res.status(400).json("Unfortunately, chatting to yourself will make a blackhole")
        }

        if(!id){
            return res.status(400).json('Provide data!')
        }
        const found = await User.findOneAndUpdate({_id:id},{$addToSet:{chats:req.user._id}},{new:true})
        const found1 = await User.findOneAndUpdate({_id:req.user.id},{$addToSet:{chats:id}},{new:true})
        res.status(201).json({
            chatList:found1.chats
        })
        
    }catch(e){
        res.status(400).json("Issue with starting the chat: "+ e.message)
    }
}

const deleteChat=async(req,res)=>{
    try{
        const theOne= await User.findOne({_id:req.body.id})
        const user= req.body.id

        if(!user){
            return res.status(400).json('Provide data!')
        }
        //Beware the chat data is never deleted its just deleted from the req.user's chatlist not even the recepient
        const lol= await User.findOneAndUpdate({_id:req.user.id},{$pull:{'chats':user}},{new:true})
        res.status(201).json({
            chatList:lol.chats
        })
    }catch(e){
        res.status(400).json("Issue deleting chat: "+e.message)
    }
}

const chatList=async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.user.id})
        if(!user){
            return res.status(400).json("Issues finding the needed user!")
        }

        res.status(200).json({
            chatList:user.chats
        })
    }catch(e){
        res.status(400).json("Issues getting the chatlist")
    }
}

const findChats=async(req,res)=>{
    try{
        const chatId= req.body.chatId;
        if(!chatId){
            return res.status(400).json("Keep quiet!")
        }

        const fund = await Messages.find({chatId}).sort({ created: 1 })
        
        if(!fund){
            return res.status(400).json("This chats does not exist!")
        }

        res.status(200).json({
            chats:fund
        })
    }catch(e){
        res.status(400).json("Issue getting chats")
    }
}

const findLastMessage=async(req,res)=>{
    try{
        const {chatId,receiver}= req.body;
        const found = await Chats.findOne({chatId})
        const read= await Messages.findOne({chatId,sender:receiver,isRead:false})
        let isRead=true
        if(read){
            isRead=false
        }
        if(!found || !chatId){
            return res.status(400).json("Dont waste my time man!")
        }

        res.status(200).json({
            lastMessage:found.latestMessage,
            isRead,
        })
    }catch(e){
        res.status(400).json("Heelo there!")
    }
}


module.exports={chatList,addChat,deleteChat,findLastMessage,findChats}