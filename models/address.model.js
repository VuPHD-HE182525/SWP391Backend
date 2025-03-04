import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
    address_line: {
        type: String,
        default: ""
    },

    city: {
        type: String,
        default: ""
    },

    state: {
        type: String,
        default: ""
    },

    pincode: {
        type: String
    },

    country: {
        type: String
    },

    mobile: {
        type: String,
        default: null
    },

    status: {
        type: Boolean,
        default: true
    },

    userID: {
        type: mongoose.Schema.ObjectId,
        default: "",
        ref: "User"
    },

    fullName: {
        type: String,
        default: null
    },

    email: {
        type: String,
        default: null
    }
},
    { timestamp: true }
)

const AddressModel = mongoose.model("Address", addressSchema)

export default AddressModel