const User = require("../models/user.js");
const Products = require("../models/product.js");
const Orders = require("../models/order.js");

// 1. Buyer creates an offer (Locks intent, waits for Porter)
const createOffer = async (req, res) => {
    try {
        const { farmerId, productId, price, quantity } = req.body;
        if (!farmerId || !productId || !price || !quantity) {
            throw new Error("All fields are required");
        }
        
        const product = await Products.findById(productId);
        if (!product) throw new Error("Product not found");

        const newOrder = new Orders({
            product: productId,
            buyer: req.user._id,
            farmer: farmerId,
            price,
            quantity,
            status: "pending_verification"
        });

        await newOrder.save();
        res.status(200).json({ message: "Offer sent. Waiting for Depot Verification.", order: newOrder });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. Buyer views their offers (Dashboard)
const myOffers = async (req, res) => {
    try {
        const orders = await Orders.find({ buyer: req.user._id }).populate('product');
        res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 3. Mark as Paid & Boost Rating (The Growth Engine)
const finalizeSuccessfulPurchase = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await Orders.findById(id);
        
        if (!order) throw new Error("Order not found");
        if (order.status === "paid") throw new Error("Order already finalized");

        // Lock the payment status
        order.status = "paid";
        await order.save();

        // Reward the Buyer with a higher rating for being genuine
        const buyer = await User.findById(order.buyer);
        if (buyer) {
            buyer.buyerStats.successfulOffers += 1;
            // Formula: Rating increases by 0.1 for every successful transaction
            let newRating = 5.0 + (buyer.buyerStats.successfulOffers * 0.1);
            buyer.buyerStats.rating = Math.round(newRating * 10) / 10; 
            await buyer.save();
        }

        res.status(200).json({ message: "Purchase successful, Buyer rating increased.", order });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { createOffer, myOffers, finalizeSuccessfulPurchase };