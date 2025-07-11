const Chats= require("../models/chats.js")
const Messages= require("../models/messages.js")
const User= require("../models/user.js")




const addChat = async (req, res) => {
    try {
        const { id: recipientId } = req.body; // The ID of the person to chat with
        const senderId = req.user._id; // The ID of the logged-in user

        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required." });
        }

        // Prevent a user from chatting with themselves
        if (senderId.toString() === recipientId) {
            return res.status(400).json({ message: "You cannot start a chat with yourself." });
        }

        // Use Promise.all to update both users at the same time.
        // $addToSet is smart: it only adds the ID if it's not already there.
        const [updatedSender, updatedRecipient] = await Promise.all([
            User.findByIdAndUpdate(senderId, { $addToSet: { chats: recipientId } }, { new: true }),
            User.findByIdAndUpdate(recipientId, { $addToSet: { chats: senderId } }, { new: true })
        ]);

        if (!updatedSender || !updatedRecipient) {
            throw new Error("Failed to update chat lists for one or both users.");
        }

        // Return the updated chat list of the person who started the chat.
        res.status(201).json({
            message: "Chat started successfully.",
            chatList: updatedSender.chats
        });

    } catch (e) {
        res.status(500).json({ message: "Issue starting chat: " + e.message });
    }
};

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

const chatList = async (req, res) => {
    try {
        // The `protect` middleware already gives us `req.user`, so we don't need to find it again.
        if (!req.user || !req.user.chats) {
            return res.status(404).json({ message: "Could not find user's chat list." });
        }
        res.status(200).json({
            chatList: req.user.chats
        });
    } catch (e) {
        res.status(500).json({ message: "Issue getting the chat list: " + e.message });
    }
};

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