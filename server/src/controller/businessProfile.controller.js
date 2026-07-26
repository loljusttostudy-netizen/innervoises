import { BusinessProfile } from "../models/businessProfile.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getProfile = asyncHandler(async (req, res) => {
    let profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });
    if (!profile) {
        profile = await BusinessProfile.create({ user: req.user._id, updatedBy: req.user._id });
    }
    return res.status(200).json(
        new ApiResponse(200, profile, "Business profile retrieved successfully")
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const updateData = req.body;
    updateData.user = req.user._id;
    updateData.updatedBy = req.user._id;

    let profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });
    if (!profile) {
        profile = await BusinessProfile.create(updateData);
    } else {
        profile = await BusinessProfile.findByIdAndUpdate(profile._id, updateData, { new: true, runValidators: true });
    }

    return res.status(200).json(
        new ApiResponse(200, profile, "Business profile updated successfully")
    );
});

const uploadImageField = (fieldName, urlKey, publicIdKey) => asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, `No ${fieldName} image provided`);
    }

    let profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });
    if (!profile) {
        profile = await BusinessProfile.create({ user: req.user._id, updatedBy: req.user._id });
    }

    // Delete existing if present
    if (profile[publicIdKey]) {
        await deleteFromCloudinary(profile[publicIdKey]);
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.path);
    if (!cloudinaryResult) {
        throw new ApiError(500, `Failed to upload ${fieldName} image`);
    }

    profile[urlKey] = cloudinaryResult.secure_url;
    profile[publicIdKey] = cloudinaryResult.public_id;
    profile.user = req.user._id;
    profile.updatedBy = req.user._id;
    await profile.save();

    return res.status(200).json(
        new ApiResponse(200, profile, `${fieldName} image uploaded successfully`)
    );
});

const deleteImageField = (fieldName, urlKey, publicIdKey) => asyncHandler(async (req, res) => {
    let profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });
    if (!profile) {
        throw new ApiError(404, "Business profile not found");
    }

    if (profile[publicIdKey]) {
        await deleteFromCloudinary(profile[publicIdKey]);
    }

    profile[urlKey] = "";
    profile[publicIdKey] = "";
    profile.updatedBy = req.user._id;
    await profile.save();

    return res.status(200).json(
        new ApiResponse(200, profile, `${fieldName} image deleted successfully`)
    );
});

export {
    getProfile,
    updateProfile,
    uploadImageField,
    deleteImageField
};
