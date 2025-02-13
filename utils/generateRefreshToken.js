import jwt from "jsonwebtoken";
import User from '../models/user.model.js';

const generatedRefreshToken = async(userId) => {
    const token = jwt.sign(
        {id : userId},
        process.env.SECRET_REFRESH_TOKEN,
        {expiresIn : '7d'}
    );

    const updateRefreshToken = await User.updateOne(
        {_id : userId},
        {
            refresh_token : token
        }
    );

    return token
}

export default generatedRefreshToken