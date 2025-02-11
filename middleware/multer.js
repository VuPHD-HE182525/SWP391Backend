import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "unloads");
    },
    filename: function (req, file, cb) {
        cb(null, '${Date.now()}-${file.originalname}');
    },
});

export const upload = multer({ storage: storage });

export default upload;