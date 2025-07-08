const Products = require("../models/product.js")



const createproduct= async(req,res)=>{
    try{
        const {name,description,price,quantity,location}= req.body;  

        if(!name || !description || !price || !quantity || !location){
            throw new Error("All fields are required")
        }

        if(req.user.role!="farmer"){
            throw new Error("Wrong role!")
        }

        const farmer= req.user._id
        const newProduct =await  new Products({
            name,
            description,
            price,
            quantity,
            location,
            farmer
        })
        if(!newProduct){
            throw new Error("Product not created")

        }

        await newProduct.save()
        res.status(200).json(newProduct)

        
    }catch(e){
        res.status(500).json(e.message)
    
    }
}

const products= async(req,res)=>{
    try{
        const products = await Products.find()
        res.status(200).json(products)
    }catch(e){
        res.status(500).json(e.message)
    
    }
}

const product =async(req,res)=>{
    try{
        const id=req.params.id;
        const product = await Products.findById(id)
        res.status(200).json(product)
    

    }catch(e){
        res.status(500).json(e.message)
    
    }
}


const updateproduct= async(req,res)=>{
    try{
        const id=req.params.id;
        const {name,description,price,quantity,location,farmer}= req.body;  
        const product = await Products.findByIdAndUpdate(id,{
            name,
            description,
            price,
            quantity,
            location,
            farmer
        })
        if(!product){
            throw new Error("Product not updated")

        }

        product.save()
        res.status(200).json(product)
    }catch(e){
        res.status(500).json(e.message)
    
    }
}

const deleteproduct= async(req,res)=>{
    try{
        const id=req.params.id; 
        const newProduct = await Products.findByIdAndDelete(id)
        if(!newProduct){
            throw new Error("Product not deleted")

        }
        res.status(200).json(product)
    }catch(e){
        res.status(500).json(e.message)
    
    }
}

module.exports={createproduct,products,updateproduct,deleteproduct,product}