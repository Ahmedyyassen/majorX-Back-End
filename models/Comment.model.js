const { Schema, model } = require("mongoose");


const CommentSchema = new Schema({
    postID:{
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    text:{
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    username:{
        type: String,
        required: true
    }
},{ timestamps: true});


const Comment = model("Comment", CommentSchema);
const createComment  =  async(data)=> (await Comment.create(data)).populate("user", ["-password", "-__v"]);

module.exports = {
    Comment,
    createComment
}