const { connect } = require("mongoose");

const connectToDB = async()=>{
    try {
        await connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully ^_^");        
    } catch (error) {
        console.log("Failed to connect to DB");
        
    }
}
module.exports = connectToDB;