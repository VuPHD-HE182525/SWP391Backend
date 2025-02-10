import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/register', async(req, resp) => {
    try {
        const {name, email, password} = req.body;
        let user = await User.findOne({email : email });
        if(user){
            return resp.status(400).json({message : "User registered with this email"})
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new User({
            name,
            email,
            password : hashPassword
        });
        await user.save();

        resp.json({message : "Register successfully"});
    } catch (error) {
        console.log(error);
        resp.status(500).json({message: "Register failed"});
    }
})

router.post('/login', async(req, resp) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email})

        if(!user){
            return resp.status(400).json({message: "User not register"})
        }
        if(user.status!=="Active"){
            return resp.status(400).json({message: "Contact to admin"})
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if(!validPassword){
            return resp.status(400).json({message: "Your password is wrong"})
        }
        const token = jwt.sign(
            {id: user._id},
            process.env.SECRET_KEY_ACCESS_TOKEN,
            {expiresIn : '5h'}
        )

        resp.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });

        resp.json({
            message: "Login successfully", 
            token : {token}
        });
    } catch (error) {
        console.log(error);
        resp.status(500).json({message: "Login failed"});
    }
})

router.get('/logout', auth, async(req, resp) => {
    resp.clearCookie("token");
    resp.json({message: "Logout successfully"});
})
export default router;