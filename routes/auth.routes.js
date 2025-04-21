const express = require("express");
const { registerCtl, loginCtl, logoutCtrl, verifyUserAccoutCtrl, forgetPasswordCtrl, resetPasswordCtrl, checkOTPCtrl } = require("../controller/auth.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const router = express.Router();

router.route('/register').post(registerCtl);
router.route('/login').post(loginCtl);
router.route('/verifyAccount').post(verifyUserAccoutCtrl)
router.route('/logout').post( verifyToken, logoutCtrl);

router.route('/forgetPassword').post( forgetPasswordCtrl );
router.route('/verify/checkOTP').post(checkOTPCtrl);
router.route('/resetpassword').post(resetPasswordCtrl);



module.exports = router;