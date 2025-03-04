import { Router } from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import {
    createCategory,
    uploadImages,
    getCategories,
    getCategoriesCount,
    getSubCategoriesCount,
    getCategory,
    removeImageFromCloudinary,
    deleteCategory,
    updatedCategory
} from '../controllers/category.controller.js';


const categoryRouter = Router();

categoryRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
categoryRouter.post('/create', auth, createCategory);
categoryRouter.get('/categories', getCategories);
categoryRouter.get('/get/count', getCategoriesCount);
categoryRouter.get('/get/count/subCat', getSubCategoriesCount);
categoryRouter.get('/:id', getCategory);

categoryRouter.get('/:id', getCategory);
categoryRouter.delete('/deleteImage', auth, removeImageFromCloudinary);
categoryRouter.delete('/:id', auth, deleteCategory);
categoryRouter.put('/:id', auth, updatedCategory);






export default categoryRouter;
