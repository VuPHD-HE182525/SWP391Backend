import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"],
        unique: true
    },
    image: {
        type: String,
    },
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        default: null
    },
    
},{timestamps: true});


const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel