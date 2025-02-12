import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Import the User model

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user from the database based on the decoded userId
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error(); // Throw an error if the user is not found
        }

        req.user = user; // Add the complete user object to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Not authorized' });
    }
};

export default auth;