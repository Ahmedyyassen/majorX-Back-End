const appError = require("../utils/AppError");
const status = require('../utils/httpStatusText')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'images/')
    },
    filename: (req, file, cb)=>{
        const ext = file.mimetype.split("/")[1];
        const fileName = `${file.originalname}-${Date.now()}.${ext}`;
        cb(null, fileName);
    }
})

const fileFilter = (req, file, cb)=>{
    const isImage = file.mimetype.split("/")[0];
    if(isImage === "image"){
        return cb(null, true)
    }else{
        const error = appError.create("only images are allowed", 400, status[400])
        return cb(error, false)
    }
}

const upload = multer({ storage: storage, fileFilter});

module.exports = upload;