import CategoryModel from '../models/category.model.js';

import { v2 as cloudinary } from 'cloudinary';
import { error } from 'console';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


//image upload
var imagesArr = [];
export async function uploadImages(request, response) {
    try {
        imagesArr = [];

        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        return response.status(200).json({
            images: imagesArr
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//create category
export async function createCategory(request, response) {
    try {
        imagesArr = [];

        const image = request.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        let category = new CategoryModel({
            name: request.body.name,
            images: imagesArr,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName
        })
        if (!category) {
            response.status(500).json({
                message: "Category not created",
                error: true,
                success: false,
            })
        }


        category = await category.save();
        imagesArr = [];

        response.status(500).json({
            message: "Category created",
            error: false,
            success: true,
            category: category
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get category
export async function getCategories(request, response) {
    try {
        console.log("📌 Đang lấy danh mục từ MongoDB...");
        const categories = await CategoryModel.find();
        console.log("✅ Danh mục lấy được:", categories);

        if (!categories.length) {
            return response.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục nào trong cơ sở dữ liệu!"
            });
        }

        // Chuyển danh mục thành dạng map để dễ nhóm
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat._id] = { 
                _id: cat._id,
                name: cat.name, 
                images: cat.images, 
                parentId: cat.parentId ? cat.parentId.toString() : null, // Convert ObjectId thành string
                children: [] 
            };
        });

        // Nhóm danh mục con vào danh mục cha
        const rootCategories = [];
        categories.forEach(cat => {
            if (cat.parentId) {
                const parentIdStr = cat.parentId.toString();
                if (categoryMap[parentIdStr]) {
                    categoryMap[parentIdStr].children.push(categoryMap[cat._id]);
                } else {
                    console.warn(`⚠️ Không tìm thấy danh mục cha cho ID: ${cat._id}`);
                }
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        console.log("✅ Kết quả sau khi nhóm danh mục:", rootCategories);

        return response.status(200).json({
            success: true,
            categories: rootCategories
        });

    } catch (error) {
        console.error("❌ Lỗi trong quá trình lấy danh mục:", error);
        return response.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh mục",
            error: error.message || error
        });
    }
}


//get category count 
export async function getCategoriesCount(request, response) {
    try {
        const categoryCount = await CategoryModel.countDocuments({ parentId: undefined });
        if (!categoryCount) {
            response.status(500).json({
                error: true,
                success: false
            });
        }
        else {
            response.send({
                categoryCount: categoryCount,
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get sub category count 
export async function getSubCategoriesCount(request, response) {
    try {
        const categories = await CategoryModel.find();
        if (!categories) {
            response.status(500).json({
                success: false,
                error: true
            });
        }
        else {
            const subCatList = [];
            for (let cat of categories) {
                if (cat.parentId !== undefined) {
                    subCatList.push(cat);
                }
            }

            response.send({
                subCategoryCount: subCatList.length,
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get single category
export async function getCategory(request, response) {
    try {
        const categories = await CategoryModel.findById(request.params.id);
        if (!categories) {
            response.status(500).json({
                message: "Category with the given ID was not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
                error: false,
                success: true,
                category: categories
            });
        
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// remove Image category
export async function removeImageFromCloudinary(request, response) {
    try {

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// delete category
export async function deleteCategory(request, response) {
    const category = await CategoryModel.findById(request.params.id);
    const images = category.images;
    let img ="";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(result, error);
            });
        }
    }

    const subCategory = await CategoryModel.find({ 
        parentId: request.params.id 
    });

    for (let i = 0; i < subCategory.length; i++) {

        const thirdsubCategories = await CategoryModel.find({
            parentId: subCategories[i]._id
        });
        for (let i = 0; i < thirdsubCategories.length; i++) {
            const deleteThirdsubCategories = await CategoryModel.findByIdAndDelete(
                thirdsubCategory[j]._id
            );
        }
        const deleteSubCat = await CategoryModel.findByIdAndDelete(
            subCategory[i]._id
        );
    }
    const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);

    if (!deletedCat) {
        response.status(404).json({
            message: "Category not found",
            error: true,
            success: false,
        })
    }
    response.status(200).json({
        error: false,
        success: true,
        message: "Category deleted!",
    }) 

}


// update category
export async function updatedCategory(request, response) {
        const categories = await CategoryModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                images: imagesArr,
                parentId: request.body.parentId,
                parentCatName: request.body.parentCatName
            },
            { new: true }

        );
        if (!categories) {
            response.status(500).json({
                message: "Category cannot be updated",
                error: true,
                success: false,
            })
        }
        imagesArr = [];
        response.status(200).json({
            error: false,
            success: true,
            category: category
        })

}
