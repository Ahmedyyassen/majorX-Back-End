const { sign } = require("jsonwebtoken")

module.exports = (payload)=>{
    return sign(payload, process.env.JWT_Secret_Key, { expiresIn: '1d' } )
}