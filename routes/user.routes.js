import express, { response } from "express";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import auth from "../middleware/auth.js";
import AddressModel from "../models/address.model.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import generedRefreshToken from "../utils/generateRefreshToken.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloud_Config_Cloud_Name,
    api_key: process.env.cloud_Config_api_key,
    api_secret: process.env.cloud_Config_api_secret,
    secure: true
});

const router = express.Router();

router.post('/register', async(req, resp) => {
    try {
        console.log("Received request:", req.body);
        const {name, email, password, birthdate, gender, address_detail, mobile} = req.body;
        let user = await User.findOne({email : email });
        if(user){
            return resp.status(400).json({message : "User registered with this email"})
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        if (!/^\d{10}$/.test(mobile)) {
            return resp.status(400).json({ message: "Invalid phone number. It must contain exactly 10 digits." });
        }
        
        user = new User({
            name,
            email,
            password: hashPassword,
            birthdate,
            gender: gender || "Male", // Mặc định là Male nếu không có giá trị
            mobile,
            address_detail: [] // Sẽ cập nhật sau nếu có địa chỉ
        });

        await user.save(); // Lưu user trước để lấy _id

        let addressIds = [];
        if (address_detail) {
            let addresses = Array.isArray(address_detail) ? address_detail : [address_detail]; // Nếu là chuỗi thì biến thành mảng

            for (let addr of addresses) {
                let addressObj = {};

                if (typeof addr === "string") {
                    let parts = addr.split(",").map(part => part.trim());
                    addressObj = {
                        address_line: parts[0] || "",
                        city: parts[1] || "",
                        state: parts[2] || "",
                        country: parts[3] || "Viet Nam", // Mặc định Việt Nam nếu không có
                        mobile: mobile,
                        userID: user._id
                    };
                } else {
                    // Nếu đã là object thì giữ nguyên
                    addressObj = {
                        address_line: addr.address_line || "",
                        city: addr.city || "",
                        state: addr.state || "",
                        country: addr.country || "Viet Nam",
                        mobile: addr.mobile || mobile,
                        userID: user._id
                    };
                }

                let newAddress = new AddressModel(addressObj);
                await newAddress.save();
                addressIds.push(newAddress._id);
            }
        }

        // Cập nhật danh sách địa chỉ cho user
        if (addressIds.length > 0) {
            user.address_detail = addressIds;
            await user.save();
        }

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
        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await generedRefreshToken(user._id);

        const updateUser = await User.findByIdAndUpdate(user?._id, {
            last_login_date : new Date()
        })

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        resp.cookie('accessToken', accessToken, cookieOption)
        resp.cookie('refreshToken', refreshToken, cookieOption)

        return resp.json({
            message: 'Login successfully',
        })
    } catch (error) {
        console.log(error);
        resp.status(500).json({message: "Login failed"});
    }
})

router.get('/logout', auth, async(req, resp) => {
    try {
        const userid = req.userId 
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        resp.clearCookie('accessToken', cookieOption)
        resp.clearCookie('refreshToken', cookieOption)

        const removeRefreshToken = await User.findByIdAndUpdate(userid, {
            refresh_token : ''
        })
        return resp.json({
            message : 'Logout successfully'
        })
    } catch (error) {
        return resp.status(500).json({
            message : error.message || error
        })
    }
})

var imagesArr = [];
router.post('', auth, async(req, resp) => {
    try {
        imagesArr = [];
        const userId = req.userId;
        const image = req.file;

        for(let i=0; i< req?.file?.length; i++){
            const option = {
                use_filename: true,
                unique_filename: false,
                overwrite: false
            };
        }
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
})

export default router;