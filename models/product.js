const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // URL to Cloudinary or your storage
    stock: { type: Number, required: true }, // The amount the farmer claims to have
    verifiedWeight: { type: Number, default: 0 }, // What the Porter actually measures
    pricePerUnit: { type: Number, required: true }, 
    unit: { 
        type: String, 
        required: true, 
        // Enforcing standard agricultural metrics so buyers know exactly what they are pricing
        enum: ["kg", "crate", "sack", "bunch", "piece", "ton"] 
    },
    location: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ["LISTED", "IN_DEPOT", "SOLD", "TRANSIT", "DELIVERED", "CANCELLED"], 
        default: "LISTED" 
    },
    dateJoined: { type: Date, default: Date.now }
});

const Products = mongoose.model("Product", productSchema);

module.exports = Products;