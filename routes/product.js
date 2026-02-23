// routes/product.js
const express = require("express");
const router = express.Router();
const { getProducts, createProduct, verifyAtDepot } = require("../controllers/product");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

router.get("/", getProducts);

// Only farmers and mansarts can list goods
router.post("/", protect, authorize(["farmer", "mansart"]), createProduct);

// ONLY the Porter can verify goods at the depot
router.patch("/verify/:id", protect, authorize("porter"), verifyAtDepot);

// Porter/Admin Operations
router.post("/depot/farmer", protect, authorize(["porter", "admin"]), porterAddFarmer);
router.get("/depot/farmers", protect, authorize(["porter", "admin"]), getMyDepotFarmers);
router.patch("/depot/verify", protect, authorize(["porter", "admin"]), verifyAndLock);

// Status updates for Transport (triggered by Porter when Boda arrives)
router.patch("/depot/transport/:id", protect, authorize(["porter", "admin"]), async (req, res) => {
    const { transportStatus } = req.body;
    const order = await Orders.findByIdAndUpdate(req.params.id, { transportStatus }, { new: true });
    res.status(200).json(order);
});

module.exports = router;