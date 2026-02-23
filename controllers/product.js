const Products = require("../models/product.js");
const User = require("../models/user.js");
const Orders = require("../models/order.js");

// PORTER: Create/Sign up a farmer for the depot
const porterAddFarmer = async (req, res) => {
    try {
        const { name, produceType, location, phoneNumber } = req.body;
        // Password defaults to phoneNumber for the pilot (simple login)
        const farmer = await User.create({
            name,
            email: `${phoneNumber}@mavuno.com`, // Virtual email for ID
            password: phoneNumber, 
            location,
            role: "farmer",
            depotLocation: req.user.depotLocation // Assigned to the Porter's depot
        });
        res.status(201).json(farmer);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// PORTER: Get all farmers in MY depot
const getMyDepotFarmers = async (req, res) => {
    try {
        const farmers = await User.find({ 
            role: "farmer", 
            depotLocation: req.user.depotLocation 
        }).select("-password");
        res.status(200).json(farmers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// PORTER: The Gatekeeper - Verify and set the Depot State
const verifyAndLock = async (req, res) => {
    try {
        const { orderId, actualWeight, action } = req.body; // action: 'ACCEPT' or 'DECLINE'
        
        const order = await Orders.findById(orderId).populate('product');
        if (!order) throw new Error("Order not found");

        if (action === 'DECLINE') {
            order.status = "cancelled";
            await order.save();
            return res.status(200).json({ message: "Order Declined and Returned to Farmer" });
        }

        // If Accept: Update weight and move to payment state
        order.status = "awaiting_payment";
        await order.save();
        
        // Update the actual weight in the product model
        await Products.findByIdAndUpdate(order.product._id, { verifiedWeight: actualWeight });

        res.status(200).json({ message: "Verified. Buyer notified to pay." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};