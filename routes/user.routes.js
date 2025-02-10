import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

router.post('/login', async(req, resp) => {
    try {
        const {email, password} = req.body();
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
        resp.json({message: "Login successfully"});
    } catch (error) {
        console.log(error);
        resp.status(500).json({message: "Login failed"});
    }
})

module.exports = router;