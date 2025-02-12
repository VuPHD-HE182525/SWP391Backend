import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Import the User model

const auth = async (req, res, next) => {
    try {
        // Lấy token từ cookie hoặc header
        const token = req.cookies.token || req?.headers?.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Provide token",
                error: true,
                success: false
            });
        }

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
        const user = await User.findById(decoded.userId || decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        req.user = user; // Gán user vào request để sử dụng sau này
        next();
    } catch (error) {
        return res.status(500).json({
            message: "You have not logged in",
            error: true,
            success: false
        });
    }
};

export default auth;
