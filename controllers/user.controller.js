import UserModel from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendEmail } from "../config/emailService.js";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

export async function registerUserController(request, response){
    try {
        let user;

        const {name, email, password} = request.body;
        if(!name || !email || !password ){
            return response.status(400).json({
                message: "provide name, email, password",
                error: true,
                success: false
            })
        }
        user = await UserModel.findOne({email: email});
        if(user){
            return response.json({
                message: "User already register with this email",
                error: true,
                success: false
            })
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const payload = {
            name,
            email,
            password: hashPassword
        }
        
        user = new UserModel ({
            email: email,
            password: password,
            name: name, 
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        })

        await user.save();

        const verifyEmail = await sendEmailFun({
            sendTo: email,
            subject: "Verify email from Online Shop",
            text: "",
            html: VerificationEmail(name, verifyCode)
        })

        const token = jwt.sign(
            {email: user.email, id: user._id},
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
        
        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! Please verify your email.",
            token: token,
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response){
    try {
        const {email, otp} = request.body; 
        const user = await UserModel.findOne({email: email});
        if(!user){
            return response.status(400).json({
                success: false,
                error: true,
                message: "User not found"
            })
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if(isCodeValid && isNotExpired){
            user.verify_email = true;
            user.otp = null;
            user.otpExpires =null;
            await user.save();
            return response.status(200).json({
                success: true,
                error: false,
                message: "Email verified successfully"
            })
        }
        else if(!isCodeValid){
            return response.status(400).json({
                success: false,
                error: true,
                message: "Invalid OTP"
            })
        }
        else{
            return response.status(400).json({
                success: false,
                error: true,
                message: "OTP expired"
            })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function loginUserController(request, response) {
   try {
    const {email, password} = request.body;

    const user = await UserModel.findOne({email : email});
    if(!user){
        return response.status(400).json({
            message: "User not register",
            error: true,
            success: false
        })
    }
    if(user.status!=="Active"){
        return response.status(400).json({
            message: "Contact to admin",
            error: true,
            success: false
        })
    }
    const checkPassword = await bcryptjs.compare(password, user.password);
    if(!checkPassword){
        return response.status(400).json({
            message: "Your password is wrong",
            error: true,
            success: false
        })
    }

    const accesstoken = await generateAccessToken(user._id);
    const refreshtoken = await generateRefreshToken(user._id);
    const updateUser = await UserModel.findByIdAndUpdate(
        user?._id,{
            last_login_date : new Date()
        }
    )

    const cookiesOption = {
        httpOnly : true,
        secure : true,
        sameSite : "None"
    }
    response.cookie('accessToken', accesstoken, cookiesOption)
    response.cookie('refreshToken', refreshtoken, cookiesOption)

    return response.json({
        message : "Login successfully",
        error: false,
        success: true,
        data: {
            accesstoken,
            refreshtoken
        }
    })
   } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
   }
}

export async function logoutUserController(request, response) {
    try {
        const userid = request.userId;

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.clearCookie("accesstoken", cookiesOption)
        response.clearCookie("refreshtoken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })
        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}