const cloudinary = require("cloudinary").v2
const { join } = require("path");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const cloudinaryUploadImage = async(file)=>{
    try {
        const imagePath = join(__dirname, `../images/${file.filename}`);
        const result = await cloudinary.uploader.upload(imagePath, {
            resource_type: 'auto'
        })
        fs.unlinkSync(imagePath);
        return result;
    } catch (error) {
        return error
    }
}
const cloudinaryRemoveImage = async(imagePublicID)=>{
    try {
        const result = await cloudinary.uploader.destroy(imagePublicID);
        return result;
    } catch (error) {
        throw new Error("Internal server error (cloundinary)");
    }
}
const cloudinaryRemoveMultipleImage = async(imagesPublicIDs)=>{
    try {
        const result = await cloudinary.api.delete_resources(imagesPublicIDs)
        return result;
    } catch (error) {
        throw new Error("Internal server error (cloundinary)");
    }
}
module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
}