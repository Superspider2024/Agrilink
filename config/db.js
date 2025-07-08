const mongoose = require('mongoose');
require('dotenv').config()


//the main function o connect the server to the database
const connect = async()=>{
    try{
        await mongoose.connect(process.env.MONGOOSE)
        console.log('connected to database...');
    }catch(e){
    console.log(e.message);
    }
}

module.exports = connect;
