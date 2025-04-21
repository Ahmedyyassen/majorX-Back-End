const joi = require("joi")

const validateComment = (obj)=>{
    const schema = joi.object({
        postID: joi.string().trim().required().label("Post ID"),
        text: joi.string().trim().min(1).required(),
     })
    return schema.validate(obj);
}

const validateUpdateComment = (obj)=>{
    const schema = joi.object({
        text: joi.string().trim().min(1)
    })
    return schema.validate(obj);
}

module.exports = {
    validateComment,
    validateUpdateComment
}