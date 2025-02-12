import { Router } from "express";
import { registerUserController, verifyEmailController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router()

// userRouter.post('/register', registerUserController)
userRouter.post('/verifyEmail', verifyEmailController)

export default userRouter

