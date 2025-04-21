const { Schema, model } = require("mongoose");
const { ADMIN, USER, MANGER } = require("../utils/userRole");
const { ref } = require("joi");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  profilePhoto: {
        url: {
            type: String,
            default: process.env.PROFILE_IMAGE,
          },
          public_id: {
            type: String,
            default: null,
          },
  },
  bio:{
    type: String
  },
  role:{
    type: String,
    enum: [ADMIN, MANGER, USER],
    default: USER
  },
  isAccountVerified:{
    type: Boolean,
    default: false
  },
  followers:[
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  following:[
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ]
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//  Populate Posts that Belongs to This User When he get his profile
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id"
})

const UserModel = model("User", userSchema);

// Functions
const findAllUsers = async(data)=>await  UserModel.find(data, {__v: false, id: false, password: false})
.populate({
  path: "posts", 
  select: "-__v",
  populate: {
    path: "user",
    select: "-password -__v",
  }})
const findUserByEmail = async(email)=>await  UserModel.findOne({email},{__v: false})
const findUserByID = async(id)=> await UserModel.findOne({_id: id}, {__v: false, password: false })
.populate({
  path: "posts", 
  select: "-__v",
  populate: {
    path: "comments",
    select: "-__v",
    populate: {
      path: "user",
      select: "-password -__v",
    }
  }})
const createUser = (data)=> new UserModel(data);
const saveUser = async(newUser)=> newUser.save();
const updateUser = async(id, data)=> await  UserModel.findByIdAndUpdate(id, {$set: {...data}}, {new: true})
.populate({
  path: "posts", 
  select: "-__v",
  populate: {
    path: "comments",
    select: "-__v",
    populate: {
      path: "user",
      select: "-password -__v",
    }
  }})
const deleteUser = async(id)=> await UserModel.findOneAndDelete({_id: id});
const getUsersCount = async()=> await UserModel.countDocuments();


module.exports = {
    UserModel,
    findAllUsers,
    findUserByEmail,
    findUserByID,
    createUser,
    saveUser,
    updateUser,
    deleteUser,
    getUsersCount
}