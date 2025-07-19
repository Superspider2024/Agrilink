/*
================================================================================
  FILE: controllers/ussdController.js (The Final, Complete Version)
  PURPOSE: The complete brain of your USSD service with full, working menus
           for registration, login, and all farmer actions.
================================================================================
*/
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// In-memory session store for the hackathon. Simple and fast.
const sessions = {};

// --- HELPER FUNCTION to get the main Farmer Menu ---
const getFarmerMenu = () => {
    return `CON Farmer Menu:
1. Add Produce
2. View My Products
3. View My Offers
0. Back`;
};

exports.ussdHandler = async (req, res) => {
    const { phoneNumber, text } = req.body;
    let response = '';
    
    // Use a simple session based on phone number
    let session = sessions[phoneNumber] || {};

    // Handle "Back" command (user enters 0)
    if (text.endsWith('*0')) {
        const parts = text.split('*');
        parts.pop(); // Remove the '0'
        parts.pop(); // Go back one level
        const newText = parts.join('*');
        // Rerun the handler with the new, shorter text string
        return exports.ussdHandler({ body: { phoneNumber, text: newText } }, res);
    }

    try {
        if (text === '') {
            // Main Menu
            response = `CON Welcome to AgriLink!
1. Register
2. Login`;
        } 
        // --- REGISTRATION ---
        else if (text.startsWith('1')) {
            const parts = text.split('*');
            if (parts.length === 1) response = `CON Enter your full name:`;
            else if (parts.length === 2) response = `CON Enter your location (e.g., Nairobi):`;
            else if (parts.length === 3) response = `CON Choose your role:\n1. Farmer\n2. Buyer`;
            else if (parts.length === 4) response = `CON Set your 4-digit PIN:`;
            else if (parts.length === 5) {
                const [_, name, location, roleChoice, pin] = parts;
                const role = roleChoice === '1' ? 'farmer' : 'buyer';
                
                const newUser = new User({ name, email: `${phoneNumber}@agrilink.ussd`, password: pin, location, role });
                await newUser.save();

                response = `END Registration successful! You can now log in using *384#.`;
                delete sessions[phoneNumber];
            }
        }
        // --- LOGIN ---
        else if (text.startsWith('2')) {
            const parts = text.split('*');
            const user = await User.findOne({ email: `${phoneNumber}@agrilink.ussd` });

            if (!user) {
                response = `END You are not registered. Please register first.`;
            } else if (parts.length === 1) {
                response = `CON Welcome, ${user.name}. Enter your PIN:`;
            } else if (parts.length === 2) {
                const pin = parts[1];
                if (pin !== user.password) { // Use bcrypt in production
                    response = `END Incorrect PIN.`;
                } else {
                    // --- SUCCESSFUL LOGIN ---
                    session.user = user; // Store user in session
                    if (user.role === 'farmer') {
                        response = getFarmerMenu();
                    } else {
                        response = `CON Buyer Menu:\n1. Browse Marketplace\n2. View My Orders`;
                    }
                }
            }
            // --- FARMER MENU ACTIONS ---
            else if (session.user && session.user.role === 'farmer') {
                const farmerChoice = parts[2];
                // --- 1. Add Produce ---
                if (farmerChoice === '1') {
                    if (parts.length === 3) response = `CON Enter produce name:`;
                    else if (parts.length === 4) response = `CON Enter quantity (e.g., 50 kg):`;
                    else if (parts.length === 5) response = `CON Enter price per unit (e.g., 120):`;
                    else if (parts.length === 6) {
                        const [,,, name, quantity, price] = parts;
                        const newProduct = new Product({ name, quantity, price, location: session.user.location, farmer: session.user._id, description: 'Listed via USSD' });
                        await newProduct.save();
                        response = `CON Product listed successfully!\n\n${getFarmerMenu()}`;
                    }
                }
                // --- 2. View My Products ---
                else if (farmerChoice === '2') {
                    const myProducts = await Product.find({ farmer: session.user._id });
                    if (myProducts.length === 0) {
                        response = `CON You have no products listed.\n\n${getFarmerMenu()}`;
                    } else {
                        let productList = myProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                        response = `END Your Products:\n${productList}`;
                    }
                }
                // --- 3. View My Offers ---
                else if (farmerChoice === '3') {
                    const myOffers = await Order.find({ farmer: session.user._id, status: 'pending' }).populate('product', 'name').populate('buyer', 'name');
                    if (myOffers.length === 0) {
                        response = `CON You have no pending offers.\n\n${getFarmerMenu()}`;
                    } else {
                        let offerList = myOffers.map((o, i) => `${i + 1}. Offer from ${o.buyer.name} for ${o.product.name}`).join('\n');
                        response = `END Pending Offers:\n${offerList}`;
                    }
                }
            }
        }
    } catch (err) {
        console.error("USSD Error:", err);
        response = `END An error occurred. Please try again.`;
    }

    sessions[phoneNumber] = session;
    res.set('Content-Type', 'text/plain');
    res.send(response);
};
