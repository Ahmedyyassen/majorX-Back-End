const joi = require("joi")

const validatePost = (obj)=>{
    const schema = joi.object({
        decsription: joi.string().trim().min(10).required(),
    })
    return schema.validate(obj);
}

const validateUpdatePost = (obj)=>{
    const schema = joi.object({
        decsription: joi.string().trim().min(10),
    })
    return schema.validate(obj);
}


module.exports = { validatePost, validateUpdatePost }