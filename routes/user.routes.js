const express = require("express");
const { getAllUsersCtrl, getUserProfileCtrl, updateUserCtl, deleteUserCtl, getUsersCountCtl, toggleFollow } = require("../controller/users.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { validateObjectID } = require("../middlewares/validateObjectID");
const router = express.Router();
const upload = require('../middlewares/imageHundler');
const { allowedAdmin, allowedAdminAndUser, allowedUser } = require("../middlewares/verifyRole")

// /api/users/profile
router.route('/profile').get( getAllUsersCtrl );

// /api/users/profile/:id
router.route('/profile/:id').get( validateObjectID,verifyToken, getUserProfileCtrl )
                            .put( validateObjectID, verifyToken , upload.single('avatar'),  updateUserCtl )
                            .delete( validateObjectID, verifyToken, allowedAdminAndUser , deleteUserCtl )

router.route('/count').get( getUsersCountCtl );
router.route("/follow/:id").put( verifyToken, toggleFollow )              

                        
module.exports = router;