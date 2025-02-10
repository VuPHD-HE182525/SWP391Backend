import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import connectDB from "./config/connectDB.js"
import userRouter from "./router/user.router.js"

const app = express();
import cartRoutes from './routes/cart.routes.js'; // Add .js extension if it's a JS file
import orderRoutes from './routes/order.routes.js'; // Add .js extension if it's a JS file
import addressRoutes from './routes/address.routes.js'; // Add .js extension if it's a JS file
app.use(cors());
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}));
app.use('/api/cart', cartRoutes); // Mount cart routes at '/api/cart'
app.use('/api/orders', orderRoutes); // Mount order routes at '/api/orders'
app.use('/api/addresses', addressRoutes); // Mount address routes at '/api/addresses'

app.get("/", (request, response) => {
    ///server to client
    response.json(
        {
            message: "Server is running" + process.env.PORT
        }
    )
})

app.use("/api/user", userRouter)

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT)
    })
}) 