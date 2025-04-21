const AppError = require("../utils/AppError");
const statusText = require("../utils/httpStatusText");
const { verify } = require("jsonwebtoken");


const verifyToken = (req, res, next)=>{
    const authToken = req.headers.authorization || req.headers.Authorization || req.cookies.token;
    
    if (authToken) {
        let token;
        if (req.cookies.token) {
            token = authToken;
        }else{
            token = authToken.split(" ")[1];         
        }
        try {     
            const decodedPayload = verify(token, process.env.JWT_Secret_Key);
            req.currentUser = decodedPayload;
            next(); 
        } catch (error) {
            const err = AppError.createError("You are not authorized", 401, statusText[401]);
            return next(err)
        }
    }else{
        const err = AppError.createError("Invaild token", 401, statusText[401]);
        return next(err)
    }   
    }

module.exports = { 
    verifyToken
};