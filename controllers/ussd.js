const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// In-memory session store. Simple and fast for a hackathon.
const sessions = {};

exports.ussdHandler = async (req, res) => {
    const { phoneNumber, text } = req.body;
    let response = '';

    // Get the user's current session or create a new one
    let session = sessions[phoneNumber] || {};

    const textParts = text.split('*');
    let level = textParts.length;

    if (text === '') {
        // This is the first request. Show the main menu.
        response = `CON Welcome to AgriLink!
        1. Register
        2. Login`;
    } 
    // --- REGISTRATION FLOW ---
    else if (text.startsWith('1')) { 
        if (level === 1) {
            response = `CON Enter your full name:`;
        } else if (level === 2) {
            session.name = textParts[1];
            response = `CON Enter your location (e.g., Nairobi):`;
        } else if (level === 3) {
            session.location = textParts[2];
            response = `CON Choose your role:
            1. Farmer
            2. Buyer`;
        } else if (level === 4) {
            session.role = textParts[3] === '1' ? 'farmer' : 'buyer';
            response = `CON Set your 4-digit PIN:`;
        } else if (level === 5) {
            session.pin = textParts[4];
            response = `CON Confirm your PIN:`;
        } else if (level === 6) {
            if (textParts[5] !== session.pin) {
                response = `END PINs do not match. Please try again.`;
                delete sessions[phoneNumber];
            } else {
                // Create user in DB (password is the PIN)
                const newUser = new User({
                    name: session.name,
                    email: `${phoneNumber}@agrilink.ussd`, // Create a dummy email
                    password: session.pin, // In a real app, you'd hash this
                    location: session.location,
                    role: session.role,
                });
                await newUser.save();
                response = `END Registration successful! You can now log in.`;
                delete sessions[phoneNumber];
            }
        }
    }
    // --- LOGIN & FARMER FLOW ---
    else if (text.startsWith('2')) {
        const user = await User.findOne({ email: `${phoneNumber}@agrilink.ussd` });

        if (!user) {
            response = `END You are not registered. Please register first.`;
        } else if (level === 1) {
            response = `CON Welcome back, ${user.name}. Enter your PIN:`;
        } else if (level === 2) {
            const pin = textParts[1];
            // In a real app, you'd use bcrypt.compare
            if (pin !== user.password) {
                response = `END Incorrect PIN. Please try again.`;
            } else {
                // Login successful
                if (user.role === 'farmer') {
                    response = `CON Farmer Menu:
                    1. Add Produce
                    2. View My Products
                    3. View Offers`;
                } else {
                    // Buyer Menu
                    response = `CON Buyer Menu:
                    1. Browse Marketplace
                    2. View My Orders`;
                }
            }
        }
        // Farmer Action: Add Produce
        else if (user.role === 'farmer' && text.startsWith('2*1')) {
             if (level === 2) {
                response = `CON Enter produce name:`;
            } else if (level === 3) {
                session.productName = textParts[2];
                response = `CON Enter quantity (e.g., 50 kg):`;
            } else if (level === 4) {
                session.productQuantity = textParts[3];
                response = `CON Enter price (e.g., 120):`;
            } else if (level === 5) {
                session.productPrice = textParts[4];
                response = `CON Confirm Listing:
                Name: ${session.productName}
                Qty: ${session.productQuantity}
                Price: ${session.productPrice}
                1. Confirm
                2. Cancel`;
            } else if (level === 6) {
                if (textParts[5] === '1') {
                    const newProduct = new Product({
                        name: session.productName,
                        quantity: session.productQuantity,
                        price: session.productPrice,
                        location: user.location,
                        farmer: user._id,
                        description: 'Listed via USSD'
                    });
                    await newProduct.save();
                    response = `END Your produce has been listed successfully!`;
                } else {
                    response = `END Canceled.`;
                }
                delete sessions[phoneNumber];
            }
        }
    }

    // Save the session for the next request
    sessions[phoneNumber] = session;

    res.set('Content-Type', 'text/plain');
    res.send(response);
};