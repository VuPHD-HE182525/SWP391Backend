import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.routes.js";  // userRouter từ feature
import productRouter from "./routes/product.routes.js";  // productRouter từ feature

const app = express();
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import addressRoutes from './routes/address.routes.js';
import userRoutes from './routes/user.routes.js'; // userRoutes từ develop
import categoryRouter from "./routes/category.routes.js";

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:5173',  // Địa chỉ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
}));
app.options('*', cors());  // Cho phép mọi phương thức OPTIONS

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));  // Thêm chế độ log 'dev' cho gọn nhẹ
app.use(helmet({
    crossOriginResourcePolicy: false
}));

// Mount API routes
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/user', userRouter);   // Sử dụng userRouter từ feature
app.use('/api/users', userRoutes);  // Giữ lại userRoutes từ develop
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);

app.get("/", (request, response) => {
    response.json({
        message: "Server is running on port " + process.env.PORT
    });
});

// Kết nối database và chạy server
connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT);
    });
});
