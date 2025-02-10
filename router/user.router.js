import { Router } from "express";
import {loginUserController, logoutUserController, registerUserController, verifyEmailController} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const userRouter = Router()
userRouter.post("/register", registerUserController)
userRouter.post("/verifyEmail", verifyEmailController)
userRouter.post("/login", loginUserController)
userRouter.get("/logout", auth, logoutUserController)

export default userRouter;