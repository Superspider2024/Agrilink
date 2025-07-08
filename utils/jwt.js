const jwt = require("jsonwebtoken");


//geerates a token
const generateToken=async (id,email,role)=>{
    return await jwt.sign({id,role,email},process.env.SECRET,{
        expiresIn:'30d'
    })
}


module.exports=generateToken