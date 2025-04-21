const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

const validateObjectID = (req, res, next)=>{
    const { id , postID } = req.params;
    if (id) {
        if(!mongoose.Types.ObjectId.isValid(id)){
            const err = AppError.createError("Invaild id", 400, httpStatusText[400]);
            return next(err); 
        }
        next();
    }else if(postID){
        if(!mongoose.Types.ObjectId.isValid(postID)){
            const err = AppError.createError("Invaild id", 400, httpStatusText[400]);
            return next(err); 
        }
        next();
    }
}
module.exports = { validateObjectID }