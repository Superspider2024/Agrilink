const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ["pending_verification", "awaiting_payment", "paid", "cancelled"], 
        default: "pending_verification" // Waits for Porter to say YES
    },
    transportStatus: {
        type: String,
        enum: ["idle", "dispatched", "arrived_at_depot", "in_transit", "delivered"],
        default: "idle"
    },
    paymentConfirmed: { type: Boolean, default: false },
    dateJoined: { type: Date, default: Date.now }
});

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;