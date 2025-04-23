const { Schema, model } = require("mongoose");
const joi = require("joi")


const CategorySchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type: String,
        required: true,
        trim: true
    }
},{ timestamps: true });


const Category = model("Category", CategorySchema);

const validateCategory = (obj)=>{
    const schema = joi.object({
        title: joi.string().trim().min(2).max(100).required(),
     })
    return schema.validate(obj);
}

module.exports = {
    Category,
    validateCategory
}