
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// In-memory session store for any temporary data if needed, though the main flow is stateless.
const sessions = {};

// --- HELPER FUNCTIONS for clean menus ---
const getMainMenu = () => `CON Welcome to AgriLink!\n1. Register\n2. Login`;
const getFarmerMenu = (name) => `CON Welcome, ${name}!\n1. Add Produce\n2. Manage My Products\n3. View Offers`;
const getBuyerMenu = (name) => `CON Welcome, ${name}!\n1. Browse Products\n2. View My Orders`;

// --- FIX: Added the endUssdSession controller back in ---
// This function is called by the frontend simulator to clear the session memory.
exports.endUssdSession = (req, res) => {
    const { phoneNumber } = req.body;
    if (sessions[phoneNumber]) {
        delete sessions[phoneNumber];
        console.log(`Session ended for ${phoneNumber}`);
        res.status(200).json({ success: true, message: 'Session ended.' });
    } else {
        res.status(200).json({ success: true, message: 'No active session to end.' });
    }
};

exports.ussdHandler = async (req, res) => {
    const { phoneNumber, text } = req.body;
    let response = '';
    const textParts = text.split('*');

    try {
        if (text === '') {
            // Clear any old session when a new dialogue starts
            if (sessions[phoneNumber]) {
                delete sessions[phoneNumber];
            }
            response = getMainMenu();
        } 
        // --- REGISTRATION FLOW (STATELESS) ---
        else if (textParts[0] === '1') {
            if (textParts.length === 1) response = `CON Enter your full name:`;
            else if (textParts.length === 2) response = `CON Enter your location (e.g., Nairobi):`;
            else if (textParts.length === 3) response = `CON Choose your role:\n1. Farmer\n2. Buyer`;
            else if (textParts.length === 4) response = `CON Set your 4-digit PIN:`;
            else if (textParts.length === 5) {
                const [_, name, location, roleChoice, pin] = textParts;
                const role = roleChoice === '1' ? 'farmer' : 'buyer';
                
                const existingUser = await User.findOne({ email: `${phoneNumber}@1agrilink.ussd` });
                if (existingUser) {
                    response = `END A user with this phone number already exists. Please try logging in.`;
                } else {
                    await new User({ name, email: `${phoneNumber}@agrilink.ussd`, password: pin, location, role }).save();
                    response = `END Registration successful! Dial *384# again to log in.`;
                }
            }
        }
        // --- LOGIN & MAIN MENU FLOW ---
        else if (textParts[0] === '2') {
            const user = await User.findOne({ email: `${phoneNumber}@agrilink.ussd` });
            if (!user) {
                response = `END You are not registered. Please register first.`;
            } else if (textParts.length === 1) {
                response = `CON Welcome, ${user.name}. Enter your PIN:`;
            } else if (textParts.length === 2) {
                const pin = textParts[1];
                if (pin !== user.password) { // Use bcrypt in production
                    response = `END Incorrect PIN.`;
                } else {
                    if (user.role === 'farmer') response = getFarmerMenu(user.name);
                    else response = getBuyerMenu(user.name);
                }
            }
            // --- LOGGED-IN ACTIONS ---
            else if (textParts.length > 2) {
                const user = await User.findOne({ email: `${phoneNumber}@agrilink.ussd` }); // Re-fetch user to be safe
                const userChoice = textParts[2];
                // --- FARMER ACTIONS ---
                if (user.role === 'farmer') {
                    if (userChoice === '1') { // Add Produce
                        if (textParts.length === 3) response = `CON Enter produce name:`;
                        else if (textParts.length === 4) response = `CON Enter quantity (e.g., 50 kg):`;
                        else if (textParts.length === 5) response = `CON Enter price per unit (e.g., 120):`;
                        else if (textParts.length === 6) {
                            const [,,, name, quantity, price] = textParts;
                            await new Product({ name, quantity, price, location: user.location, farmer: user._id, description: 'Listed via USSD' }).save();
                            response = `END Product listed successfully!`;
                        }
                    } else if (userChoice === '2') { // Manage My Products
                        const myProducts = await Product.find({ farmer: user._id });
                        if (myProducts.length === 0) response = `END You have no products listed.`;
                        else {
                            let productList = myProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.quantity}`).join('\n');
                            response = `END Your Products:\n${productList}`;
                        }
                    } else if (userChoice === '3') { // View Offers
                        const myOffers = await Order.find({ farmer: user._id, status: 'pending' }).populate('product', 'name');
                        if (myOffers.length === 0) response = `END You have no pending offers.`;
                        else {
                            let offerList = myOffers.map((o, i) => `${i + 1}. Offer for ${o.product.name}`).join('\n');
                            response = `END Pending Offers:\n${offerList}`;
                        }
                    }
                }
                // --- BUYER ACTIONS ---
                else if (user.role === 'buyer') {
                    if (userChoice === '1') { // Browse Products
                        const allProducts = await Product.find().populate('farmer', 'name');
                        if (allProducts.length === 0) response = `END The marketplace is currently empty.`;
                        else {
                            let productList = allProducts.map((p, i) => `${i + 1}. ${p.name} from ${p.farmer.name}`).join('\n');
                            response = `END Available Products:\n${productList}`;
                        }
                    } else if (userChoice === '2') { // View My Orders
                        const myOrders = await Order.find({ buyer: user._id }).populate('product', 'name');
                        if (myOrders.length === 0) response = `END You have no orders.`;
                        else {
                            let orderList = myOrders.map((o, i) => `${i + 1}. ${o.product.name} (${o.status})`).join('\n');
                            response = `END Your Orders:\n${orderList}`;
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error("USSD Error:", err);
        response = `END An error occurred. Please try again.${err.message}`;
    }
    
    res.set('Content-Type', 'text/plain');
    res.send(response);
};
