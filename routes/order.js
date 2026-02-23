const express = require("express");
const router = express.Router();
const { createOffer, myOffers, finalizeSuccessfulPurchase } = require("../controllers/order");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

// Buyer makes an offer
router.post("/offer", protect, authorize(["buyer"]), createOffer);

// Buyer views their dashboard of offers
router.get("/my-offers", protect, authorize(["buyer"]), myOffers);

// Finalize purchase (Triggered by system or Admin once M-Pesa is received)
router.patch("/finalize/:id", protect, authorize(["admin", "porter", "buyer"]), finalizeSuccessfulPurchase);

module.exports = router;