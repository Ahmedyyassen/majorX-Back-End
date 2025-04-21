const appError = require("../utils/AppError");
const httpStatus = require("../utils/httpStatusText");


const allowedAdmin = (req, res, next)=>{    
    if(req.currentUser.role !== 'ADMIN'){
        const error = appError.createError("Access denied, forbidden, Only Admin can be access", 403, httpStatus[403] );
        return next(error);
    }    
    next();
}

const allowedUser = (req, res, next)=>{        
    if(req.params.id !== req.currentUser.id){
        const error = appError.createError("Access denied, forbidden, Only User can be access", 403, httpStatus[403] );
        return next(error);
    }else{
        next();
    }
}

const allowedAdminAndUser = (req, res, next)=>{
    if ( req.currentUser.id === req.params.id || req.currentUser.role === "ADMIN" ) {
        next();
    }else{  
        const error = appError.createError("Access denied, forbidden, not allowed", 403, httpStatus[403] );
        return next(error);
    }
}

module.exports = {
    allowedAdmin,
    allowedUser,
    allowedAdminAndUser
}
