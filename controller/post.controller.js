const asyncHandler = require("../middlewares/asyncHandler");
const { createPost, getPost, deletePost, updatePost, Post, getPostsCount } = require("../models/Post.model");
const appError = require('../utils/AppError');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloundinary");
const statusText = require("../utils/httpStatusText");
const { validatePost, validateUpdatePost } = require("../utils/validatePost");
const { Comment } = require("../models/Comment.model")
const fs = require("fs");
const { join } = require('path');
const { populate } = require("dotenv");

/** 
* @desc  GET All Posts 
* @route api/posts
* @method GET
* @access public
*/
const getAllPostsCtl = asyncHandler(
    async(req, res, next)=>{
        const { page } = req.query;
        const limit = req.query.limit || 1; 
        const skip = ( page -1 )* limit ;
        let posts;
        if (page) {
            posts = await Post.find({},{__v: false}).skip(skip).limit(limit).sort({ createdAt: -1 })
            .populate("user", ["-password","-__v"]).populate({
                                        path: "comments", 
                                        select: "-__v",
                                        populate: {
                                          path: "user",
                                          select: "-password -__v",
                                        },
                                      });
        }else{
            posts = await Post.find({}, {__v: false}).sort({ createdAt: -1 })
                                    .populate("user", ["-password","-__v"])
                                    .populate({
                                        path: "comments", 
                                        select: "-__v",
                                        populate: {
                                          path: "user",
                                          select: "-password -__v",
                                        },
                                      });
        }
        res.status(200).json({status: statusText[200], message: "Fetch posts successfully", data: {post:posts}})
})

/** 
* @desc  GET Post
* @route api/post/:id
* @method GET
* @access public
*/
const getPostCtl = asyncHandler(
    async(req, res, next)=>{
        const postID = req.params.id;
        const post = await Post.findById(postID ,{__v: false})
                                .populate("user", ["-password", "-__v"])
                                .populate("comments", ["-__v"]);
        if(!post){
            const err = appError.createError("Post is not found", 404, statusText[404]);
            return next(err);
        }
        res.status(200).json({status: statusText[200], message: "Fetch post successfully", data: {post}})
})

/** 
* @desc  Get Posts Count 
* @route api/get/post/count
* @method Get
* @access public
*/
const getPostCountCtl = asyncHandler(
    async(req, res, next)=>{
        const count = await getPostsCount();
        res.status(200).json({status: statusText[200], message: "Fetch count successfully", data: {count}});
    }
)

/** 
* @desc  Create New Post 
* @route api/posts
* @method POST
* @access private (only looged user)
*/

const createPostCtl = asyncHandler(
    async(req, res, next)=>{
       const {error} = validatePost(req.body);
       if (error) {
        // this remove phote if we have an error
        const imagePath = join(__dirname, `../images/${req.file.filename}`);     
        fs.unlinkSync(imagePath);
        const err = appError.createError(error.details[0].message, 400, statusText[400]);
        return next(err);
       }
       
       let newPost;
       if(req.file){
        const image = await cloudinaryUploadImage(req.file);
         newPost = await createPost({
         ...req.body,
          user: req.currentUser.id,
          image: { url: image.secure_url, public_id: image.public_id }
         });
       }else{
         newPost = await createPost({
            ...req.body,
             user: req.currentUser.id,
            });
        }
        res.status(201).json({status: statusText[201], message: "post created successfully", data: {post:newPost}})
})

/** 
* @desc  Update Post 
* @route api/posts/id
* @method PUT
* @access private (only owener user)
*/
const updatePostCtl = asyncHandler(
    async(req, res, next)=>{
        const postID = req.params.id;
        const post = await getPost(postID);
        if(!post){
            const err = appError.createError("Post is not found", 404, statusText[404]);
            return next(err);
        } 
        if (req.currentUser.id !== post.user.toString()) {
            const err = appError.createError("access denied, you are not allowed", 403, statusText[403]);
            return next(err);
        }
        // Handle Error validation
       const {error} = validateUpdatePost(req.body);
       if (error) {
        // this remove phote if we have an error
        const imagePath = join(__dirname, `../images/${req.file.filename}`);     
        fs.unlinkSync(imagePath);
        const err = appError.createError(error.details[0].message, 400, statusText[400]);
        return next(err);
       }

       if (req.file) {
           await cloudinaryRemoveImage(post.image.public_id);
           const result = await cloudinaryUploadImage(req.file);
           req.body.image = { url: result.secure_url, public_id: result.public_id }
       }
       const updatedPost = await updatePost(postID, req.body);
        res.status(200).json({ status: statusText[200], message:"Post updated successfully", data:{post: updatedPost} })
})

/** 
* @desc  Delete Post 
* @route api/posts/id
* @method DELETE
* @access private ( owner user & admin)
*/
const deletePostCtl = asyncHandler(
    async(req, res, next)=>{
        const postId = req.params.id;
        const post = await getPost(postId);
        if(!post){
            const err = appError.createError("Post is not found", 404, statusText[404]);
            return next(err);
        }        
        // !This post for this user  ==> we don't use middleware becase params for post not user
        if (req.currentUser.id === post.user.toString() || req.currentUser.role === "ADMIN") {
            await cloudinaryRemoveImage(post.image.public_id);
            await Comment.deleteMany({ postID: post._id })
            await deletePost(postId);
            
            res.status(200).json({status: statusText[200], message: "post deleted successfully"});

        }else{
            res.status(403).json({status: statusText[403], message: "access denied, forbidden"});
        }
})
/** 
* @desc  Toggle Like Post 
* @route api/posts/like/:id
* @method PUT
* @access private ( only logged user)
*/
const toggleLikeCtrl = asyncHandler(
    async(req, res, next)=>{                
        const postID = req.params.postID;
        const userID = req.currentUser.id;        
        let post = await getPost(postID)
                      
        if(!post){
            const err = appError.createError("Post is not found", 404, statusText[404]);
            return next(err);
        }
        const isUserLikePost = post.likes.find((user)=> user.toString() === userID);
        if (isUserLikePost) {
            post = await Post.findByIdAndUpdate(postID, {
                $pull: { likes: userID }
            }, { new: true}).populate("user", ["-password", "-__v"])
        }else{
            post = await Post.findByIdAndUpdate(postID, {
                $push: { likes: userID }
            }, { new: true}).populate("user", ["-password", "-__v"])
        }
        res.status(200).json({status: statusText[200], message: "Like has changed successfully", data: { post }});
    }
)

module.exports = {
    createPostCtl,
    getAllPostsCtl,
    getPostCtl,
    updatePostCtl,
    deletePostCtl,
    getPostCountCtl,
    toggleLikeCtrl
}