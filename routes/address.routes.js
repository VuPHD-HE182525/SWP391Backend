import express from 'express';
const router = express.Router();
import Address from '../models/address.model.js'; // Import your Address model
import auth from '../middleware/auth.js'; // Import your authentication middleware

// Get all addresses for the authenticated user
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the authenticated user
        const addresses = await Address.find({ user: userId }); // Find addresses associated with the user
        res.status(200).json(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ message: "Failed to fetch addresses" });
    }
});

export default router;