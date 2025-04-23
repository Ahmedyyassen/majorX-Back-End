const asyncHandler = require("../middlewares/asyncHandler")
const { findUserByEmail, createUser, saveUser, UserModel } = require("../models/User.models");
const appError = require('../utils/AppError');
const statusText = require("../utils/httpStatusText");
const { genSalt, hash, compare } = require("bcryptjs");
const { validatRegister, validatLogin } = require("../utils/validatUser");
const generateJWT = require("../utils/generateJWT");
const { VerificationOTP } = require("../models/VerificationOTP");
const sendEmail = require("../utils/SendEmail");
const { oneMinuteExpiry } = require("../helpers/OTPValidate");

/** 
* @desc Register new user
* @route api/auth/register
* @method POST
* @access public
*/
const registerCtl = asyncHandler(
    async(req, res, next)=>{
        
    const { username, email, password, role} = req.body;
    
    const { error } = validatRegister(req.body);
    if (error) {
        const err = appError.createError(error.details[0].message, 400, statusText[400]);
        return next(err);
    }
    const existUser = await findUserByEmail(email);
    if (existUser) {
        const err = appError.createError("This user in already registered", 400, statusText[400]);
        return next(err);
    }
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt)
    const newUser = createUser({
        username,
        email,
        password:hashedPassword,
        role
    })
    await saveUser(newUser);

    // TODO  - sending email (verify account)
    const verifiyOTP = new VerificationOTP({
        userId: newUser._id,
        otp : Math.floor(Math.random()*999999),
        timestamp: new Date().getTime()
    })
    await verifiyOTP.save();

    const htmlTemplate = `
      <div style="text-align: center;">
        <p style="font-weight: bold;">Use this OTP number to verify your account ^_^</p>
        <h4><strong>${verifiyOTP.otp}</strong></h4>
     </div>
    `
    await sendEmail(newUser.email, "Verify Your Email", htmlTemplate);

    res.status(201).json({status: statusText[201], message: "We send OTP code to your email please check your email address" })
})
/** 
* @desc Login User
* @route api/auth/login
* @method POST
* @access public
*/
const loginCtl = asyncHandler(
    async(req, res, next)=>{
    const { email, password } = req.body;
    
    const { error } = validatLogin(req.body);
    if (error) {
        const err = appError.createError(error.details[0].message, 400, statusText[400]);
        return next(err);
    }
    const user = await UserModel.findOne({email});
    if (!user) {
        const err = appError.createError("This user is not found please check your email", 404, statusText[404]);
        return next(err);
    }
    const isMatched = await compare(password, user.password);
    if (!isMatched) {
        const err = appError.createError("Password is inccorect", 401, statusText[401]);
        return next(err);
    }
    // TODO  - sending email ( verify account if not verified )
    if (!user.isAccountVerified) {
        let verifiyOTP = await VerificationOTP.findOne({userId: user._id});

        if (!verifiyOTP) {
             verifiyOTP = await VerificationOTP.create({
                userId: user._id,
                otp : Math.floor(Math.random()*999999),
                timestamp: new Date().getTime()
            })        
        }else{
            const sendNextOTP = await oneMinuteExpiry(verifiyOTP.timestamp);
            if (!sendNextOTP) {
                const err = appError.createError("Please try agian after one min!", 400, statusText[400]);
                return next(err);  
            }
            verifiyOTP = await VerificationOTP.findOneAndUpdate(
                {userId: user._id },
                { otp : Math.floor(Math.random()*999999),
                timestamp: new Date().getTime() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        }

        const htmlTemplate = `
        <div style="text-align: center;">
          <p style="font-weight: bold;">Use this OTP number to verify your account ^_^</p>
          <h4><strong>${verifiyOTP.otp}</strong></h4>
       </div>
      `
      await sendEmail(user.email, "Verify Your Email", htmlTemplate);
      return res.status(307).json({status: statusText[307], message: "We send OTP code to your email please check your email address" })
    }
// **********************************************
    const token = generateJWT({id: user._id, email: user.email ,role: user.role});
    const tokenOption = { sameSite:"None", httpOnly:true, secure:true }
    res.cookie('token',token, tokenOption).status(200).json({status: statusText[200], message: "User Login successfully",data:{id   :user._id} })
})
/** 
* @desc Logout User
* @route api/auth/logout
* @method POST
* @access private
*/
const logoutCtrl = asyncHandler(
    async(req, res, next)=>{
        delete req.currentUser; 
        if (!req.currentUser) {
            res.clearCookie('token').status(200).json({status: statusText[200], message: "User Logout successfully"})       
        }
})

/** 
* @desc Verify User Account
* @route api/auth/verifyAccount
* @method POST
* @access public
*/
const verifyUserAccoutCtrl = asyncHandler(
    async(req, res, next)=>{
        const {email, otp} = req.body;
        const user = await UserModel.findOne({email});
        if (!user) {
            const err = appError.createError("user is not found", 400, statusText[400]);
            return next(err);
        }
        const verifiyOTP = await VerificationOTP.findOne({
            userId: user._id,
            otp: otp
        })
        if (!verifiyOTP) {
            const err = appError.createError("Invalid OTP code", 400, statusText[400]);
            return next(err);
        }
        user.isAccountVerified = true;
        await user.save();
        await VerificationOTP.findOneAndDelete({userId: user._id});

        res.status(200).json({status: statusText[200], message: "Your Account verified successfully"})
    }
)
/** 
* @desc Forget Account Password
* @route api/auth/forgetpassword
* @method POST
* @access public
*/
const forgetPasswordCtrl = asyncHandler(
    async(req, res, next)=>{
        const {email} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            const err = appError.createError("user is not found", 400, statusText[400]);
            return next(err);
        }
        let verifiyOTP = await VerificationOTP.findOne({userId: user._id})
        if (!verifiyOTP) {
             verifiyOTP = await VerificationOTP.create({
                userId: user._id,
                otp : Math.floor(Math.random()*999999),
                timestamp: new Date().getTime()
            })
        }else{
            const sendNextOTP = await oneMinuteExpiry(verifiyOTP.timestamp);
            if (!sendNextOTP) {
                const err = appError.createError("Please try agian after three min!", 400, statusText[400]);
                return next(err);
                }
                verifiyOTP = await VerificationOTP.findOneAndUpdate(
                {userId: user._id},
                { otp: Math.floor(Math.random()*999999),
                timestamp: new Date().getTime() },
                {upsert: true, new: true, setDefaultsOnInsert: true}
        )
        }
        
        const htmlTemplate = `
        <div style="text-align: center;">
        <p style="font-weight: bold;">Click on the link below to reset your password</p>
        <h4><strong>${verifiyOTP.otp}</strong></h4>
    </div>
    `
    await sendEmail(user.email, "Reset Your Password", htmlTemplate);
    res.status(200).json({status: statusText[200], message: "We send OTP code to your email please check your email address" })
    })

/** 
* @desc Check OTP
* @route api/auth/verify/checkOTP
* @method POST
* @access public
*/
const checkOTPCtrl = asyncHandler(
        async(req, res, next)=>{
            const {email, otp} = req.body;

            const user = await UserModel.findOne({email});
            if(!user){
            const err = appError.createError("user is not found", 400, statusText[400]);
            return next(err);
        }
            const verifyOTP = await VerificationOTP.findOne({
                userId: user._id,
                otp: otp,  
            })
            if (!verifyOTP) {
                const err = appError.createError("Invalid OTP code", 400, statusText[400]);
                 return next(err);
            }
            const otpInfo = await VerificationOTP.findOneAndDelete({userId: user._id, otp: otp});
            res.status(200).json({status: statusText[200], message: "OTP has been checked successfully (^-^)", userId: otpInfo.userId })
        })
/** 
* @desc Reset Password Handler 
* @route api/auth/resetpassword
* @method POST
* @access public
*/
const resetPasswordCtrl = asyncHandler(
        async(req, res, next)=>{
            const user = await UserModel.findOne({email: req.body.email});
            if (!user) {
                const err = appError.createError("User is not found", 400, statusText[400]);
                 return next(err);
            }
            const salt = await genSalt(10);
            const hashedPassword = await hash(req.body.password, salt);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({status: statusText[200], message: "Your password has been changed successfully (^-^)" })
        })  

module.exports = {
    registerCtl,
    loginCtl,
    logoutCtrl,
    verifyUserAccoutCtrl,
    forgetPasswordCtrl,
    checkOTPCtrl,
    resetPasswordCtrl
}