import express from 'express';
const router = express.Router();
import Order from '../models/order.model.js';
import Cart from '../models/cartproduct.model.js';
import auth from '../middleware/auth.js';

router.post("/", auth, async (req, res) => {
    try {
        const {
            orderId,
            productId,
            product_detail,
            delivery_address,
            subTotalAmt,
            totolAmt,
            paymentMethod,
        } = req.body;
        const userId = req.userId;

        const newOrder = new Order({
            userId: userId,
            orderId: orderId,
            productId: productId,
            product_detail: product_detail,
            delivery_address: delivery_address,
            subTotalAmt: subTotalAmt,
            totolAmt: totolAmt,
            paymentMethod: paymentMethod,
        });

        await newOrder.save();
        await Cart.deleteMany({ userId: userId });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});

router.get("/last", auth, async (req, res) => {
    try {
        const userId = req.userId;
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

export default router;