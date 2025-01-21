import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // file system - read, write, delete files, etc 

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        // Upload file to cloudinary
        const response=await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // jpeg, png, mp4, etc
        })
        // file uploaded successfully
        console.log("File uploaded successfully on cloudinary",response.url)
        return response;
    } 
    catch (error) {
        fs.unlinkSync(localFilePath) // delete file from local storage as upload failed
        return null;
    }
}
