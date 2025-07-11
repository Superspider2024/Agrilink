const mongoose= require('mongoose')


const chatsSchema=mongoose.Schema({
    chatId:{type:String,unique:true,lowercase:true,trim:true},
    partipants:{type:Array,lowercase:true,trim:true},
    latestMessage:{type:String,lowercase:true,trim:true},
    images:{type:Array,lowercase:true,trim:true},
    lastUpdated:{type:Date,lowercase:true,trim:true}
})

const Chats= mongoose.model("Chats",chatsSchema)

module.exports=Chats;


//Every chat has an ID yeah so we start chat with only other groups yeah then id is the chatID right, it is sliek shown all over the place
//evry chat has only two participants,yeah,one can send images,messages.
//then evry chat a perosn has is underh their chat prop only their IDs
//Then every chat has th eame liek chatID