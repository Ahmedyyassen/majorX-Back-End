const asyncHandler = require("../middlewares/asyncHandler");
const { Comment, createComment } = require("../models/Comment.model");
const { findUserByID } = require("../models/User.models");
const appError = require("../utils/AppError");
const statusText = require("../utils/httpStatusText");
const {validateComment,validateUpdateComment,} = require("../utils/vaildateComment");


/**
 *  @desc Get All Comments
 *  @route /api/comments
 *  @method GET
 *  @access private (only admin)
 */
const getAllCommentsCtrl = asyncHandler(
    async (req, res, next) => {
    const comments = await Comment.find({}, {__v: false}).populate("user", ["-password"]).populate("postID", ["-password"])
    res.status(200).json({status: statusText[200], message: "Fetch Comments successfullly", data: {comments}})
})

/** 
* @desc  Get Comments Count 
* @route api/comments/get/count
* @method GET
* @access public 
*/
const getCommentsCountCtl = asyncHandler(
    async(req, res, next)=>{
        const count = await Comment.countDocuments();
        res.status(200).json({status: statusText[200], message: "Fetch count successfully", data: {count}})
})

/**
 *  @desc Create New Comment
 *  @route /api/comments
 *  @method PUT
 *  @access private (only logged in user)
 */
const createCommmentCtrl = asyncHandler(
    async (req, res, next) => {        
  const { error } = validateComment(req.body);
  if (error) {
    const err = appError.createError(error.details[0].message,400,statusText[400]);
    return next(err);
  }
  const userId = req.currentUser.id;
  const userProfile = await findUserByID(userId); 
  
  const comment = await createComment({
        postID: req.body.postID,
        text: req.body.text,
        user: userId,
        username: userProfile.username
  })
  res.status(201).json({status: statusText[201], message: "Message created successfullly", data: {comment}})
});

/**
 *  @desc Update Comment
 *  @route /api/comments/:id
 *  @method PUT
 *  @access private (only owner of the comment)
 */
const updateCommentCtrl = asyncHandler(
    async (req, res, next) => {
    const  id  = req.currentUser.id;
    
    const commentID = req.params.id;
    console.log("commentID", commentID);
    console.log("userID", id);
    const { error } = validateUpdateComment(req.body);
    if (error) {
        const err = appError.createError(error.details[0].message,400,statusText[400]);
        return next(err);
    }

    const comment = await Comment.findById(commentID);
    if (!comment) {
        const err = appError.createError("Comment not found",404,statusText[404]);
        return next(err);
    }
    if (comment.user.toString() === id ) {
        const comment = await Comment.findByIdAndUpdate(commentID, {$set: {...req.body}}, {new: true });
        res.status(200).json({status: statusText[200], message: "Comment updated successfullly", data: {comment}})
    }else{
        const err = appError.createError("access denied, forbidden",403,statusText[403]);
        return next(err);
    }
})

/**
 *  @desc Delete Comment
 *  @route /api/comments/:id
 *  @method DELETE
 *  @access private (only admin or owner user)
 */
const deleteCommentCtrl = asyncHandler(
    async (req, res, next) => {
    const {id, role} = req.currentUser;
    const commentID = req.params.id;
    const comment = await Comment.findById(commentID)
    if (!comment) {
        const err = appError.createError("Comment not found",404,statusText[404]);
        return next(err);
    }
    if (comment.user.toString() === id || role === "ADMIN") {
        const comment = await Comment.findByIdAndDelete(commentID);
        res.status(200).json({status: statusText[200], message: "Comment deleted successfullly", data: {comment}})
    }else{
        const err = appError.createError("access denied, forbidden",403,statusText[403]);
        return next(err);
    }
})







module.exports = {
    createCommmentCtrl,
    getAllCommentsCtrl,
    deleteCommentCtrl,
    updateCommentCtrl,
    getCommentsCountCtl
}