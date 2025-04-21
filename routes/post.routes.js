const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const  router = express.Router();
const upload = require('../middlewares/imageHundler');
const { createPostCtl, getAllPostsCtl, getPostCtl, updatePostCtl, deletePostCtl, getPostCountCtl, toggleLikeCtrl } = require("../controller/post.controller");
const { validateObjectID } = require("../middlewares/validateObjectID");
const { allowedAdmin } = require("../middlewares/verifyRole")

// /api/posts
router.route("/").get(getAllPostsCtl)
                 .post(verifyToken, upload.single('post'), createPostCtl)
//  /api/posts/:id
router.route("/:id").get(validateObjectID, verifyToken, getPostCtl)
                    .put(validateObjectID, verifyToken, upload.single('post'), updatePostCtl)
                    .delete(validateObjectID, verifyToken,  deletePostCtl)

router.route("/like/:postID").put( verifyToken, toggleLikeCtrl )              
router.route("/get/post/count").get(  getPostCountCtl);

module.exports = router;