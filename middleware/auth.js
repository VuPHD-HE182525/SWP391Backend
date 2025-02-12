import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Import the User model

const auth = async (req, res, next) => {
    try {
        // Lấy token từ cookie hoặc header
        const token = req.cookies.token || req?.headers?.authorization?.split(" ")[1];

        // Find the user from the database based on the decoded userId
        const user = await User.findById(decoded.userId);

        // Giải mã token
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN || process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }

        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(decoded.id);
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