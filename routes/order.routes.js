const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const Cart = require("../models/cartproduct.model");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
    try {
        const {
            orderId,
            productId,
            product_detail,
            delivery_address,
            subTotalAmt,
            totolAmt,
        } = req.body;
        const userId = req.user.id;

        const newOrder = new Order({
            userId: userId,
            orderId: orderId,
            productId: productId,
            product_detail: product_detail,
            delivery_address: delivery_address,
            subTotalAmt: subTotalAmt,
            totolAmt: totolAmt,
        });

        await newOrder.save();
        await Cart.deleteMany({ user: userId });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});

router.get("/last", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const lastOrder = await Order.findOne({ userId: userId })
            .sort({ createdAt: -1 })
            .populate("productId")
            .populate("delivery_address");

        if (!lastOrder) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.status(200).json(lastOrder);
    } catch (error) {
        console.error("Error fetching last order:", error);
        res.status(500).json({ message: "Failed to fetch last order" });
    }
});

module.exports = router;