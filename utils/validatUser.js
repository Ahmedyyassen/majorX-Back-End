const Joi = require("joi");

// validate register user
const validatRegister = (obj)=>{
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().trim().min(3).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
    role: Joi.string().min(2).max(20)
  })
  return schema.validate(obj);
} 

// validate login user
const validatLogin = (obj)=>{
    const schema = Joi.object({
      email: Joi.string().trim().min(3).max(100).required().email(),
      password: Joi.string().trim().min(8).required()
    })
    return schema.validate(obj);
  } 

// validate updated user
  const validatUpdate = (obj)=>{
    const schema = Joi.object({
      username: Joi.string().trim().min(3).max(100),
      password: Joi.string().trim().min(8),
      bio: Joi.string(),
      role: Joi.string().trim().min(3).valid("MANGER", "ADMIN","USER")
    })
    return schema.validate(obj);
  } 

  module.exports = { 
    validatRegister,
    validatLogin,
    validatUpdate
  }