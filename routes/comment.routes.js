const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { getAllCommentsCtrl, createCommmentCtrl, deleteCommentCtrl, updateCommentCtrl,getCommentsCountCtl } = require("../controller/comment.controller");
const { validateObjectID } = require("../middlewares/validateObjectID");
const  router = express.Router();
const { allowedAdmin } = require("../middlewares/verifyRole")


router.route('/').get(verifyToken, allowedAdmin , getAllCommentsCtrl )
                .post(verifyToken, createCommmentCtrl)

router.route('/:id').put(validateObjectID, verifyToken, updateCommentCtrl)
                    .delete(validateObjectID, verifyToken, deleteCommentCtrl )

router.route("/get/count").get(getCommentsCountCtl)
                        
module.exports = router;