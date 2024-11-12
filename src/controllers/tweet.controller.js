import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) throw new ApiError(400, "Tweet content is required");

  const newTweet = await Tweet.create({ content, owner: req.user._id });

  res
    .status(201)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const tweets = await Tweet.find({ owner: req.user._id })
    .skip(skip)
    .limit(limit)
    .populate("owner", "username fullName avatar coverImage")
    .lean();

  const totalDocuments = await Tweet.countDocuments({ owner: req.user._id });
  const totalPages = Math.ceil(totalDocuments / limit);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets, currentPage: page, totalPages, totalDocuments },
        "User tweets retrieved successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;

  let tweet = await Tweet.findOne({ _id: tweetId, owner: req.user._id });
  if (!tweet) throw new ApiError(404, "Tweet not found");

  tweet.content = req.body.content || tweet.content;
  await tweet.save();

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;

  let tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!tweet) throw new ApiError(404, "Tweet not found");

  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

const getTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;

  let tweet = await Tweet.findOne({ _id: tweetId });

  if (!tweet) throw new ApiError(404, "Tweet not found");

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet retrieved successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getTweet };
