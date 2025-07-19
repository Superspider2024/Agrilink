/*
================================================================================
  FILE: controllers/ussdController.js (The Final, Professional Version)
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

exports.ussdHandler = async (req, res) => {
    const { phoneNumber, text } = req.body;
    let response = '';
    let session = sessions[phoneNumber] || {};

    // --- FIX: Robust "Back" functionality ---
    // If the user enters 0 at any point, we go back one step.
    if (text.endsWith('*0')) {
        const parts = text.split('*');
        parts.pop(); // Remove the '0'
        const lastInput = parts.pop(); // Remove the last actual input to go back
        const newText = parts.join('*');
        // Rerun the handler with the shorter text string
        return exports.ussdHandler({ body: { phoneNumber, text: newText } }, res);
    }

    try {
        const user = session.user || await User.findOne({ email: `${phoneNumber}@agrilink.ussd` });
        
        if (text === '') {
            response = getMainMenu();
        } 
        // --- REGISTRATION ---
        else if (text.startsWith('1')) {
            const parts = text.split('*');
            if (parts.length === 1) response = `CON Enter your full name:`;
            else if (parts.length === 2) response = `CON Enter your location:`;
            else if (parts.length === 3) response = `CON Choose your role:\n1. Farmer\n2. Buyer`;
            else if (parts.length === 4) response = `CON Set your 4-digit PIN:`;
            else if (parts.length === 5) {
                const [_, name, location, roleChoice, pin] = parts;
                await new User({ name, email: `${phoneNumber}@agrilink.ussd`, password: pin, location, role: roleChoice === '1' ? 'farmer' : 'buyer' }).save();
                response = `END Registration successful! Dial *384# again to log in.`;
                delete sessions[phoneNumber];
            }
        }
        // --- LOGIN ---
        else if (text.startsWith('2')) {
            const parts = text.split('*');
            if (!user) {
                response = `END You are not registered. Please register first.`;
            } else if (parts.length === 1) {
                response = `CON Welcome, ${user.name}. Enter your PIN:`;
            } else if (parts.length === 2) {
                const pin = parts[1];
                if (pin !== user.password) {
                    response = `END Incorrect PIN.`;
                } else {
                    session.user = user; // Login successful, save user to session
                    if (user.role === 'farmer') response = getFarmerMenu(user.name);
                    else response = `CON Buyer Menu:\n1. Browse Marketplace\n0. Back`;
                }
            }
            // --- FARMER ACTIONS ---
            else if (session.user && session.user.role === 'farmer') {
                const farmerChoice = parts[2];
                // --- 1. Add Produce ---
                if (farmerChoice === '1') {
                    if (parts.length === 3) response = `CON Enter produce name:`;
                    else if (parts.length === 4) response = `CON Enter quantity (e.g., 50 kg):`;
                    else if (parts.length === 5) response = `CON Enter price per unit (e.g., 120):`;
                    else if (parts.length === 6) {
                        const [,,, name, quantity, price] = parts;
                        await new Product({ name, quantity, price, location: user.location, farmer: user._id, description: 'Listed via USSD' }).save();
                        response = `CON Product listed successfully!\n\n${getFarmerMenu(user.name)}`;
                    }
                }
                // --- 2. Manage My Products ---
                else if (farmerChoice === '2') {
                    const myProducts = await Product.find({ farmer: user._id });
                    session.myProducts = myProducts; // Save products to session for later use
                    if (myProducts.length === 0) {
                        response = `CON You have no products listed.\n\n${getFarmerMenu(user.name)}`;
                    } else {
                        let productList = myProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                        response = `CON Select a product to manage:\n${productList}\n0. Back`;
                    }
                }
                // --- Sub-menu for Managing a single product ---
                else if (farmerChoice === '2' && parts.length === 4) {
                    const productIndex = parseInt(parts[3]) - 1;
                    const selectedProduct = session.myProducts[productIndex];
                    if (!selectedProduct) {
                        response = `CON Invalid selection.\n\n${getFarmerMenu(user.name)}`;
                    } else {
                        session.selectedProductId = selectedProduct._id;
                        response = `CON Manage ${selectedProduct.name}:\n1. Edit Price\n2. Delete Product\n0. Back`;
                    }
                }
                // --- Sub-sub-menu for Edit/Delete actions ---
                else if (farmerChoice === '2' && parts.length === 5) {
                    const action = parts[4];
                    // Edit Price
                    if (action === '1') {
                        response = `CON Enter new price for ${session.myProducts.find(p=>p._id == session.selectedProductId).name}:`;
                    }
                    // Delete Product
                    else if (action === '2') {
                        await Product.findByIdAndDelete(session.selectedProductId);
                        response = `CON Product deleted successfully.\n\n${getFarmerMenu(user.name)}`;
                    }
                }
                // --- Final step for editing price ---
                else if (farmerChoice === '2' && parts.length === 6 && parts[4] === '1') {
                    const newPrice = parts[5];
                    await Product.findByIdAndUpdate(session.selectedProductId, { price: newPrice });
                    response = `CON Price updated successfully.\n\n${getFarmerMenu(user.name)}`;
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
