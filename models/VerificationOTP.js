const { Schema, model, set, get } = require("mongoose");


const VerificationOTPSchema  = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    otp:{
        type: Number,
        required: true
    },
    timestamp:{
        type: Date,
        required: true,
        default: Date.now(),
        set: (timestamp)=> new Date(timestamp),
        get: (timestamp)=> timestamp.getTime() 
    }
})

const VerificationOTP = model("VerificationOTP", VerificationOTPSchema);
module.exports = {
    VerificationOTP
}