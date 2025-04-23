const asyncHandler = require("../middlewares/asyncHandler");
const { Category, validateCategory } = require("../models/Category.model");
const appError = require("../utils/AppError");
const statusText = require("../utils/httpStatusText");

/**
 *  @desc Get All Categories
 *  @route /api/categories
 *  @method GET
 *  @access public
 */
const getAllCategoryCtrl = asyncHandler(
    async (req, res, next) => {
    const categories = await Category.find({}, {__v: false})
      console.log(categories);
      
    res.status(200).json({status: statusText[200], message: "Fetch Comments successfullly", data: {categories}})
})

/**
 *  @desc Create New Category
 *  @route /api/categories
 *  @method POST
 *  @access private (only admin)
 */
const createCategoryCtrl = asyncHandler(
    async (req, res, next) => {
    const { error } = validateCategory(req.body);
    if (error) {
        const err = appError.createError(error.details[0].message,400,statusText[400]);
        return next(err);
     }   
     const category = await Category.create({
         user: req.currentUser.id,
        title: req.body.title
    })
   res.status(201).json({status: statusText[201], message: "Add New Category successfullly", data: {category}})
})

/**
 *  @desc Delete Category
 *  @route /api/categories/:id
 *  @method DELETE
 *  @access private (only admin)
 */
const deleteCategoryCtrl = asyncHandler(
    async (req, res, next) => {
        const category = await Category.findById(req.params.id);        
        if(!category){
            const err = appError.createError("Category not found".message,404,statusText[404]);
            return next(err);
        }
         const deletedCat = await Category.findByIdAndDelete(req.params.id);         
         res.status(200).json({status: statusText[200], message: "Delete Comments successfullly", data:{deletedCat} })
    })

module.exports = { 
    getAllCategoryCtrl,
    createCategoryCtrl,
    deleteCategoryCtrl
}