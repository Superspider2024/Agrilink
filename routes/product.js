const express = require("express");
const router = express.Router();
// IMPORT THE CORRECT FUNCTIONS
const { porterAddFarmer, getMyDepotFarmers, verifyAndLock } = require("../controllers/product");
const Orders = require("../models/order"); // IMPORT THE MODEL for the transport route
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

// Porter/Admin Operations
router.post("/depot/farmer", protect, authorize(["porter", "admin"]), porterAddFarmer);
router.get("/depot/farmers", protect, authorize(["porter", "admin"]), getMyDepotFarmers);
router.patch("/depot/verify", protect, authorize(["porter", "admin"]), verifyAndLock);

// Status updates for Transport (triggered by Porter when Boda arrives)
router.patch("/depot/transport/:id", protect, authorize(["porter", "admin"]), async (req, res) => {
    try {
        const { transportStatus } = req.body;
        const order = await Orders.findByIdAndUpdate(req.params.id, { transportStatus }, { new: true });
        res.status(200).json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;