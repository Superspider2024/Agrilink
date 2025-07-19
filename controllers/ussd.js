/*
================================================================================
  FILE 1: controllers/ussdController.js (The Final, Professional Version)
  PURPOSE: A complete, multi-level USSD menu system that handles adding,
           viewing, editing, and deleting products, with full "Back"
           functionality and a persistent session.
================================================================================
*/
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// In-memory session store. Simple and fast for a hackathon.
const sessions = {};

// --- HELPER FUNCTIONS for clean menus ---
const getMainMenu = () => `CON Welcome to AgriLink!\n1. Register\n2. Login`;
const getFarmerMenu = (name) => `CON Welcome, ${name}!\n1. Add Produce\n2. Manage My Products\n3. View Offers`;

// --- FIX: This function is now included and exported correctly ---
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
    
    // Use a simple session based on phone number, default level is 'main'
    let session = sessions[phoneNumber] || {};

    const textParts = text.split('*');
    const userInput = textParts[textParts.length - 1];

    try {
        // --- FIX: Robust "Back" functionality ---
        if (userInput === '0') {
            if (session.level.startsWith('farmer_')) {
                session.level = 'farmer_menu';
                response = getFarmerMenu(session.user.name);
            } else {
                session.level = 'main';
                response = getMainMenu();
            }
        } else {
            // --- This is a State Machine. It checks the session level to decide what to do. ---
            switch (session.level) {
                case 'main':
                    if (userInput === '1') {
                        session.level = 'register_name';
                        response = `CON Enter your full name:`;
                    } else if (userInput === '2') {
                        session.level = 'login_pin';
                        const user = await User.findOne({ email: `${phoneNumber}@agrilink.ussd` });
                        if (!user) {
                            response = `END You are not registered. Please register first.`;
                            delete sessions[phoneNumber];
                        } else {
                            session.user = user;
                            response = `CON Welcome, ${user.name}. Enter your PIN:`;
                        }
                    } else {
                        response = getMainMenu();
                    }
                    break;

                // --- REGISTRATION STATES ---
                case 'register_name':
                    session.name = userInput;
                    session.level = 'register_location';
                    response = `CON Enter your location:`;
                    break;
                case 'register_location':
                    session.location = userInput;
                    session.level = 'register_role';
                    response = `CON Choose your role:\n1. Farmer\n2. Buyer`;
                    break;
                case 'register_role':
                    session.role = userInput === '1' ? 'farmer' : 'buyer';
                    session.level = 'register_pin';
                    response = `CON Set your 4-digit PIN:`;
                    break;
                case 'register_pin':
                    const { name, location, role } = session;
                    await new User({ name, email: `${phoneNumber}@agrilink.ussd`, password: userInput, location, role }).save();
                    response = `END Registration successful! Dial *384# again to log in.`;
                    delete sessions[phoneNumber];
                    break;

                // --- LOGIN STATE ---
                case 'login_pin':
                    if (userInput !== session.user.password) { // Use bcrypt in production
                        response = `END Incorrect PIN.`;
                        delete sessions[phoneNumber];
                    } else {
                        if (session.user.role === 'farmer') {
                            session.level = 'farmer_menu';
                            response = getFarmerMenu(session.user.name);
                        } else {
                            response = `END Buyer USSD menu is coming soon!`;
                        }
                    }
                    break;

                // --- FARMER MENU STATES ---
                case 'farmer_menu':
                    if (userInput === '1') { // Add Produce
                        session.level = 'farmer_add_name';
                        response = `CON Enter produce name:`;
                    } else if (userInput === '2') { // Manage Products
                        const myProducts = await Product.find({ farmer: session.user._id });
                        if (myProducts.length === 0) {
                            response = `CON You have no products listed.\n\n${getFarmerMenu(session.user.name)}`;
                        } else {
                            session.myProducts = myProducts;
                            let productList = myProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                            session.level = 'farmer_manage_product_select';
                            response = `CON Select a product to manage:\n${productList}\n0. Back`;
                        }
                    } else if (userInput === '3') { // View Offers
                        const myOffers = await Order.find({ farmer: session.user._id, status: 'pending' }).populate('product', 'name');
                         if (myOffers.length === 0) {
                            response = `CON You have no pending offers.\n\n${getFarmerMenu(session.user.name)}`;
                        } else {
                            let offerList = myOffers.map((o, i) => `${i + 1}. Offer for ${o.product.name}`).join('\n');
                            response = `END Pending Offers:\n${offerList}`;
                        }
                    }
                    break;
                
                // --- Add Produce Flow ---
                case 'farmer_add_name':
                    session.productName = userInput;
                    session.level = 'farmer_add_quantity';
                    response = `CON Enter quantity (e.g., 50 kg):`;
                    break;
                case 'farmer_add_quantity':
                    session.productQuantity = userInput;
                    session.level = 'farmer_add_price';
                    response = `CON Enter price per unit (e.g., 120):`;
                    break;
                case 'farmer_add_price':
                    await new Product({ name: session.productName, quantity: session.productQuantity, price: userInput, location: session.user.location, farmer: session.user._id, description: 'Listed via USSD' }).save();
                    session.level = 'farmer_menu';
                    response = `CON Product listed successfully!\n\n${getFarmerMenu(session.user.name)}`;
                    break;

                // --- Manage Product Flow ---
                case 'farmer_manage_product_select':
                    const productIndex = parseInt(userInput) - 1;
                    const selectedProduct = session.myProducts[productIndex];
                    if (!selectedProduct) {
                        response = `CON Invalid selection.\n\n${getFarmerMenu(session.user.name)}`;
                        session.level = 'farmer_menu';
                    } else {
                        session.selectedProductId = selectedProduct._id;
                        session.level = 'farmer_manage_product_action';
                        response = `CON Manage ${selectedProduct.name}:\n1. Edit Price\n2. Delete Product\n0. Back`;
                    }
                    break;
                case 'farmer_manage_product_action':
                    if (userInput === '1') { // Edit Price
                        session.level = 'farmer_edit_price';
                        response = `CON Enter new price:`;
                    } else if (userInput === '2') { // Delete Product
                        await Product.findByIdAndDelete(session.selectedProductId);
                        session.level = 'farmer_menu';
                        response = `CON Product deleted successfully.\n\n${getFarmerMenu(session.user.name)}`;
                    }
                    break;
                case 'farmer_edit_price':
                    await Product.findByIdAndUpdate(session.selectedProductId, { price: userInput });
                    session.level = 'farmer_menu';
                    response = `CON Price updated successfully.\n\n${getFarmerMenu(session.user.name)}`;
                    break;
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
