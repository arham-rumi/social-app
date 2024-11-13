import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { SORT_TYPE, VIDEO_SORT_BY_OPTIONS } from "../constants.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const sortOrder = sortType == SORT_TYPE.DESCENDING ? -1 : 1;
  const sortOn = Object.values(VIDEO_SORT_BY_OPTIONS).includes(sortBy)
    ? sortBy
    : VIDEO_SORT_BY_OPTIONS.CREATED_AT;

  let queryObj = {};

  if (userId && isValidObjectId(userId)) {
    queryObj.owner = userId;
  }

  if (query) {
    queryObj = {
      ...queryObj,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { description: { $regex: new RegExp(query, "i") } },
      ],
    };
  }

  const videos = await Video.find(queryObj)
    .sort({ [sortOn]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate("owner", "username fullName avatar coverImage")
    .lean();

  const totalDocuments = await Tweet.countDocuments(queryObj);
  const totalPages = Math.ceil(totalDocuments / limit);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, currentPage: page, totalPages, totalDocuments },
        "Videos retrieved successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Both title and description are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Both video and thumbnail files are required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // console.log("video: ", video);
  // console.log("thumbnail: ", thumbnail);

  if (!video || !thumbnail) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
