import express, { response } from "express";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import auth from "../middleware/auth.js";
import AddressModel from "../models/address.model.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import generedRefreshToken from "../utils/generateRefreshToken.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import upload from "../middleware/multer.js";
import jwt from 'jsonwebtoken';
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
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
        let phonenumber = await User.findOne({mobile: mobile});
        if(phonenumber){
            return resp.status(400).json({message : "User registered with this mobile"})
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
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    } catch (error) {
        console.log(error);
        resp.status(500).json({message: "Login failed"});
    }
})

router.get('/logout', auth, async(req, resp) => {
    try {
        const userid = req.userId;

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        resp.clearCookie('accessToken', cookieOption)
        resp.clearCookie('refreshToken', cookieOption)

        await User.findByIdAndUpdate(userid, {
            refresh_token : ''
        });

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

router.put('/user-avatar', auth, upload.array('avatar'), async (req, resp) => {
    try {
        imagesArr = [];
        const userId = req.userId;
        const images = req.files;  // Kiểm tra lại req.files
        const user = await User.findOne({_id : userId});
        // first remove image from cloudinary
        const imgUrl = user.avatar;
        const urlArr = imgUrl.split('/');
        const avatar_image = urlArr[urlArr.length - 1];
        const imageName = avatar_image.split('.')[0];

        if(imageName){
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    console.log(error);
                    console.log(result);
                }
            )
        }

        if(!user){
            return resp.status(500).json({
                message: 'User not found'
            });
        }

        const option = {
            use_filename: true,
            unique_filename: false,
            overwrite: false
        };

        for (let i = 0; i < images.length; i++) {
            const img = await cloudinary.uploader.upload(
                images[i].path,
                option,
                function(error, result){
                    console.log(result);
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                    console.log(req.files[i].filename)
                }
            )
        }

        user.avatar = imagesArr[0];
        await user.save();

        return resp.status(200).json({
            _id: userId,
            avatar: imagesArr[0]
        });

    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        });
    }
});

router.delete('/deleteImage', auth, async(req, resp) => {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split('.')[0];

    if(imageName){
        const res = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                console.log(error);
                console.log(result);
            }
        )
        if(res){
            resp.status(200).send(res);
        }
    }
});

router.put('/:id', auth, async(req, resp) => {
    try {
        const userId = req.userId;
        const {name, birthdate, gender, mobile, email, password} = req.body;
        const userExist = await User.findById(userId);
        if(!userExist){
            return resp.status(400).send('This user cannot be updated');
        }
        let hashPassword = ''
        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }
        else{
            hashPassword = userExist.password;
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
                birthdate: birthdate,
                gender: gender,
                password: hashPassword
            },
            {new: true}
        )

        return resp.json({
            message: 'User updated successfully',
            user: updateUser
        })
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.post('/forgot-password', async(req, resp) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email : email});
        if(!user){
            return resp.status(400).json({
                message: 'Email not available'
            })
        }
        else{
            let verifyCode = Math.floor(10000 + Math.random() * 900000).toString();
            user.forgot_password_otp = verifyCode;
            user.forgot_password_expiry = Date.now() + 600000;
            await user.save();

            await sendEmailFun({
                to: email,
                subject: 'Verify email',
                text: '',
                html: VerificationEmail(user.name, verifyCode)
            })

            return resp.json({message: 'Check your email'})
        }
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.post('/verify-forgot-password-otp', async(req, resp) => {
    try {
        const {email, forgot_password_otp} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            return resp.status(400).json({
                message: 'Email not available'
            })
        }
        if(forgot_password_otp !== user.forgot_password_otp){
            return resp.status(400).json({
                message: 'OTP is invalid'
            })
        }
    
        const currentTime = new Date().toISOString();
        if(user.forgot_password_expiry < currentTime){
            return resp.status(400).json({
                message: 'OTP is expired'
            })
        }
        user.forgot_password_otp = '';
        user.forgot_password_expiry = '';
        await user.save();
        return resp.status(400).json({
            message: 'Verify OTP successfully'
        })
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.post('/reset-password', auth, async(req, resp) => {
    try {
        const {email, newPassword, confirmPassword} = req.body;
        if(!email || !newPassword || !confirmPassword){
            return resp.status(400).json({
                message: 'Provide required fields email, password, confirmPassword'
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return resp.status(400).json({
                message: 'Email is not available'
            })
        }
        if(newPassword !== confirmPassword){
            return resp.status(400).json({
                message: 'newPassword and confirmPassword must be same'
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();
        return resp.json({
            message: 'Password update successfully'
        })
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.post('/refresh-token', async(req, resp) => {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
        if(!refreshToken){
            return resp.status(401).json({
                message: 'Invalid token'
            })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN);
        if(!verifyToken){
            return resp.status(401).json({
                message: 'Token is expired'
            })
        }
        const userId = verifyToken?._id;
        const newAccessToken = await generatedAccessToken(userId);

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }
        resp.cookie('accessToken', newAccessToken, cookieOption);

        return resp.json({
            message: 'New access token generated',
            accessToken: newAccessToken
        })
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.get('/user-detail', auth, async(req, resp) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password -refresh_token');
        return resp.json({
            message: 'User details',
            data: user
        })
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});

router.post('/verify-email', async(req, resp) => {
    try {
        const {email, forgot_password_otp} = req.body;
        const user = await User.findOne({email : email});
        if(!user){
            return resp.status(400).json({message : 'User not found'})
        }
        const isCodeValid = user.forgot_password_otp === forgot_password_otp;
        const isNotExpired = user.forgot_password_expiry > Date.now();

        if(isCodeValid && isNotExpired){
            user.forgot_password_otp = null;
            user.forgot_password_expiry = null;
            await user.save();
            resp.status(200).json({message: 'Verify email successfully'})
        }
        else if(!isCodeValid){
            return resp.status(400).json({message: 'Invalid OTP'})
        }
        else if(!isNotExpired){
            return resp.status(400).json({message: 'OTP expired'})
        }
    } catch (error) {
        return resp.status(500).json({
            message: error.message || error
        })
    }
});
export default router;