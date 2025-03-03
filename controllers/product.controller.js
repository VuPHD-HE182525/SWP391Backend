import ProductModel from '../models/product.model.js';

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

//create product
export async function createProduct(request, response) {
    try {
        // Xử lý images để đảm bảo lưu nhiều ảnh
        let images = "[]"; // Mặc định lưu danh sách rỗng
        if (request.body.images) {
            if (Array.isArray(request.body.images)) {
                images = JSON.stringify(request.body.images); // Chuyển thành chuỗi JSON
            } else if (typeof request.body.images === "string") {
                images = JSON.stringify([request.body.images]); // Nếu chỉ có 1 ảnh, chuyển thành mảng JSON
            }
        }

        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            image: images,  // Lưu chuỗi JSON của danh sách ảnh
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
            catId: request.body.catId,
            subCat: request.body.subCat,
            thirsubCat: request.body.thirsubCat,
            thirsubCatId: request.body.thirsubCatId,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount
        });

        product = await product.save();

        if (!product) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Không thể tạo sản phẩm"
            });
        }

        return response.status(200).json({
            message: "Tạo sản phẩm thành công",
            error: false,
            success: true,
            data: product
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//get all products
export async function getAllProducts(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }
        const products = await ProductModel.find().populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by category id
export async function getAllProductsByCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }
        const products = await ProductModel.find({
            catId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by category name
export async function getAllProductsByCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }

        const products = await ProductModel.find({
            catName: request.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by subcategory id
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }
        const products = await ProductModel.find({
            subCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by subcategory name
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }

        const products = await ProductModel.find({
            subCat: request.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by thirdLaver category id
export async function getAllProductsByThirdLaverCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }
        const products = await ProductModel.find({
            thirdsubCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by thirdLaver category name
export async function getAllProductsByThirdLaverCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }

        const products = await ProductModel.find({
            thirdsubCat: request.query.thirdsubCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products by price
export async function getAllProductsByPrice(request, response) {
    let productList = [];

    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");
        productList = productListArr;
    }
    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category");
        productList = productListArr;
    }
    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category");
        productList = productListArr;
    }

    const filteredProductList = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });
    return response.status(200).json({
        error: false,
        success: true,
        products: filteredProductList,
        totalPages: 0,
        page: 0
    });


}

//get all products by rating
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);

        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);


        if (page > totalPages) {
            return response.status(404).json(
                {
                    message: "Page not found",
                    success: false,
                    error: true
                })
        }

        let products = [];
        if (request.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,


            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (request.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,


            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (request.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                thirdSubCatId: request.query.thirdSubCatId,


            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }


        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all products count

export async function getAllProductsCount(request, response) {
    try {
        const productCount = await ProductModel.countDocuments();

        if (!productCount) {
            response.status(500).json({
                error: true,
                success: false,
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            productCount: productCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get all features products
export async function getAllFeaturedProducts(request, response) {
    try {
        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false,
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            products: products,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete product
export async function deleteProduct(request, response) {
    const product = await ProductModel.findById(request.params.id).populate("category");
    if (!product) {
        return response.status(404).json({
            message: "Product not found",
            error: true,
            success: false
        })
    }

    const images = product.images;
    let img = "";

    for (img of images) {
        const imagUrl = img;
        const urlArr = imagUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(result, error);
            });
        }
    }
    const deleteProduct = await ProductModel.findByIdAndDelete(request.params.id);
    if (!deleteProduct) {
        response.status(500).json({
            message: "Product not deleted!",
            error: true,
            success: false
        })
    }
    return response.status(200).json({
        message: "Product deleted successfully",
        error: false,
        success: true
    })
}

//get single product
export async function getProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category");

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//delete images
export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];
    if (imageName) {
        const res = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                // console.log(result, error);
            }
        );
        if (res) {
            response.status(200).send(res);
        }
    }
}

//update product
export async function updateProduct(req, res) {
    try {
        // Lấy ID sản phẩm từ params
        const { id } = req.params;

        // Kiểm tra nếu không có ID
        if (!id) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        // Tạo object chứa dữ liệu cập nhật (chỉ cập nhật những field có trong request body)
        const updateData = {};
        const allowedFields = [
            "name", "description", "image", "brand", "price", "oldPrice", 
            "catName", "catId", "subCat", "subCatId", "thirsubCat", "thirsubCatId", 
            "countInStock", "rating", "isFeatured", "discount"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Kiểm tra nếu không có dữ liệu nào để cập nhật
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No update data provided",
                error: true,
                success: false
            });
        }

        // Cập nhật sản phẩm trong database
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });

        // Nếu không tìm thấy sản phẩm
        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

// get produrcts by sub category
export const getProductsBySubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.query;

        // Lọc sản phẩm theo subCategoryId
        const products = await ProductModel.find({ subCatId: subCategoryId });

        if (!products.length) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm nào trong subcategory này",
            });
        }

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra",
            error: error.message,
        });
    }
};
