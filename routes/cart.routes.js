import express from 'express';
const router = express.Router();
import CartProduct from '../models/cartproduct.model.js'; // Add .js extension!
import auth from '../middleware/auth.js'; // Add .js extension!

router.get('/', auth, async (req, res) => {
    try {
        const loggedInUserId = req.userId;

        const cartItems = await CartProduct.find({ userId: loggedInUserId }).populate('productId');
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const { quantity } = req.body;
        const userId = req.userId; // Get the authenticated user's ID

        // Find the cart item and check if it belongs to the user
        const cartItem = await CartProduct.findOne({ _id: cartItemId, userId });

        if (!cartItem) {
            return res.status(404).json({ error: "Cart item not found or user not authorized" });
        }

        // Update the quantity
        cartItem.quantity = quantity;
        await cartItem.save();

        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to update cart item" });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const userId = req.userId; // Get the authenticated user's ID

        // Find the cart item and check if it belongs to the user
        const deletedCartItem = await CartProduct.findOneAndDelete({ _id: cartItemId, userId });

        if (!deletedCartItem) {
            return res.status(404).json({ error: "Cart item not found or user not authorized" });
        }

        res.json({ message: "Cart item removed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove cart item" });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.userId; // Get the authenticated user's ID
        // Check if the product is already in the cart
        const existingCartItem = await CartProduct.findOne({ userId, productId: productId });
        if (existingCartItem) {
            // If the product is already in the cart, update the quantity
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
            return res.status(200).json(existingCartItem); // return the updated item
        }

        // If the product is not in the cart, create a new cart item
        const newCartItem = new CartProduct({
            userId,
            productId,
            quantity: quantity,
        });

        await newCartItem.save();
        res.status(201).json(newCartItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

router.delete("/clear", auth, async (req, res) => {
    try {
        const userId = req.userId;
        await CartProduct.deleteMany({ userId: userId });
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

export default router;