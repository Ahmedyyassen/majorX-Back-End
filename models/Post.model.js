const { Schema, model } = require("mongoose");


const postSchema = new Schema({

    decsription:{
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image:{
        url: {
            type: String,
            default: "",
          },
          public_id: {
            type: String,
            default: null,
          },
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ]
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

postSchema.virtual("comments",{
    ref: "Comment",
    foreignField: "postID",
    localField: "_id"
})

const Post = model("Post", postSchema);

const getAllPosts =  async ()=> await Post.find({}, {__v: false}).sort({ createdAt: -1 })
const getPost     =  async(id)=> await Post.findOne({_id: id}, {__v: false});
const createPost  =  async(data)=> (await Post.create(data)).populate("user", ["-password", "-__v"]);
const updatePost  =  async(id ,data)=> await Post.findOneAndUpdate({_id: id}, {$set: {...data}}, {new: true});
const deletePost  =  async(id)=> await Post.findByIdAndDelete(id);
const getPostsCount = async()=> await Post.countDocuments();



module.exports = { 
    Post,
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getPostsCount
 }