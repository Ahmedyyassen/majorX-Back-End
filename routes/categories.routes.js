const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { validateObjectID } = require("../middlewares/validateObjectID");
const { getAllCategoryCtrl, createCategoryCtrl, deleteCategoryCtrl } = require("../controller/category.controller");
const  router = express.Router();
const { allowedAdmin } = require("../middlewares/verifyRole")




router.route('/').get( getAllCategoryCtrl )
                .post(verifyToken, allowedAdmin, createCategoryCtrl )

router.route('/:id').delete(validateObjectID, verifyToken, allowedAdmin, deleteCategoryCtrl )

                        
module.exports = router;