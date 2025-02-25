import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Import the User model

const auth = async (req, res, next) => {
    try {
        // Lấy token từ cookie hoặc header
        var token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

        if(!token){
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Provide token",
                error: true,
                success: false
            });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);

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

        req.userId = user._id; 
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
