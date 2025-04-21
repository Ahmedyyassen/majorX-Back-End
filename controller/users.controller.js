const asyncHandler = require("../middlewares/asyncHandler");
const { findAllUsers, findUserByID, updateUser, deleteUser, getUsersCount, UserModel } = require("../models/User.models");
const appError = require('../utils/AppError');
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require("../utils/cloundinary");
const statusText = require("../utils/httpStatusText");
const { validatUpdate } = require("../utils/validatUser");
const { genSalt, hash } = require("bcryptjs");
const { Comment } = require("../models/Comment.model");
const { Post } = require("../models/Post.model");

/** 
* @desc  Get All Users Profile 
* @route api/users/profile
* @method GET
* @access public 
*/
const getAllUsersCtrl = asyncHandler(
    async(req, res, next)=>{
    const users = await findAllUsers({});
    res.status(200).json({status: statusText[200], message:"Fetch all users successfully", data:{users}})
})

/** 
* @desc  Get User Profile 
* @route api/users/profile/:id
* @method GET
* @access public
*/
const getUserProfileCtrl = asyncHandler(
    async(req, res, next)=>{
    const userID = req.params.id;

    const user = await findUserByID(userID);
    if (!user) {
        const err = appError.createError("This user is not found", 404, statusText[404]);
        return next(err);
    }
    res.status(200).json({status: statusText[200], message:"Fetch users successfully", data:{user}})
})

/** 
* @desc  Get Users Count 
* @route api/users/count
* @method GET
* @access public 
*/
const getUsersCountCtl = asyncHandler(
    async(req, res, next)=>{
        const count = await getUsersCount();
        res.status(200).json({status: statusText[200], message: "Fetch count successfully", data: {count}})
})

/** 
* @desc  Update User Profile 
* @route api/users/profile/:id
* @method PUT
* @access private (only user himself)
*/
const updateUserCtl = asyncHandler(
    async(req, res, next)=>{        
        const userID = req.params.id;
        // find user or not 
        const isUser = await findUserByID(userID);
        if (!isUser) {
            const err = appError.createError("This user is not found", 404, statusText[404]);
            return next(err);
        }
        // validate form 
        const { error } = validatUpdate(req.body);    
        if(error){
            const err = appError.createError(error.details[0].message, 400, statusText[400]);
            return next(err);
        }
        // if i want to change password
        if(req.body.password){
            const salt = await genSalt(10);
            req.body.password = await hash(password, salt);
        }  
        // if i want to change profile photo
        if(req.file){
            if (isUser.profilePhoto.public_id !== null) {
                await cloudinaryRemoveImage(isUser.profilePhoto.public_id)
            }
            const image = await cloudinaryUploadImage(req.file);            
            req.body.profilePhoto = { url: image.secure_url, public_id: image.public_id };
        }             
        const user = await updateUser(String(userID), req.body);
        res.status(200).json({ status: statusText[200], message:"User data updated successfully", data:{user} })
})

/** 
* @desc  Delete User Profile (Account)
* @route api/users/profile/:id
* @method DELETE
* @access private (only user himself)
*/
const deleteUserCtl = asyncHandler(
    async(req, res, next)=>{
        const userID = req.params.id;
        const user = await findUserByID(userID);
        if (!user) {
            const err = appError.createError("This user is not found", 404, statusText[404]);
            return next(err);
        }
        if (user.profilePhoto.public_id !== null) {
            await cloudinaryRemoveImage(user.profilePhoto.public_id)
        }
        const posts = await Post.find({user: userID});
        const publicIDS = posts?.map((post)=> post.image.public_id );
        if (publicIDS?.length > 0) {
            await cloudinaryRemoveMultipleImage(publicIDS);
        }

        await Post.deleteMany({ user: userID })
        await Comment.deleteMany({ user: userID })

        const deltedUser =  await deleteUser(userID);
        res.status(200).json({ status: statusText[200], message:"User deleted successfully", data:{deltedUser} })
    }
)
const toggleFollow = asyncHandler(
    async(req, res, next)=>{
        const userID = req.params.id;
        const personalID = req.currentUser.id;
        let user = await UserModel.findById(userID);
        let personal = await UserModel.findById(personalID);

        const isFollow = personal.following.find((f)=> f.toString() === userID);

        if (isFollow) {
            personal = await UserModel.findByIdAndUpdate(personalID, { $pull: { following: userID } }, {new: true});
            user = await UserModel.findByIdAndUpdate(userID, { $pull: { followers: personalID } }, {new: true})
        }else{            
            personal = await UserModel.findByIdAndUpdate(personalID, { $push: { following: userID } }, {new: true});
            user = await UserModel.findByIdAndUpdate(userID, { $push: { followers: personalID } }, {new: true});
        }
        res.status(200).json({status: statusText[200], message: "follow has changed successfully", data: {user}});
    })

module.exports = {
    getAllUsersCtrl,
    getUserProfileCtrl,
    updateUserCtl,
    deleteUserCtl,
    getUsersCountCtl,
    toggleFollow
}

