import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    console.log("File uploaded successfully at: ", result.url);

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Cloudinary error: ", error);

    return null;
  }
};

const deleteFromCloudinary = async (fileName) => {
  try {
    const result = await cloudinary.uploader.destroy(fileName, {
      invalidate: true,
    });

    console.log("File deleted successfully");

    return result;
  } catch (error) {
    console.log("Cloudinary error: ", error);

    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
