const { OnlineForum, CommentForum } = require('./onlineForum.model');
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');
const mongoose = require('mongoose');

const OnlineForumJoiSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required()
});

const commentSchema = Joi.object({
  comment: Joi.string().required(),
  parentComment: Joi.string().optional()
});

// @route POST onlineForum/
// @desc add onlineForum
exports.addOnlineForum = async (req, res) => {
  try {
    const { error } = OnlineForumJoiSchema.validate(req.body);

    if (error) {
      sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add Forum', {}, error.message);
    }

    req.body.postedBy = req.user._id;

    const onlineForum = await OnlineForum.create({ ...req.body });
    return sendSuccessResponse(res, httpStatus.OK, 'Forum Added', onlineForum);
    // })
  } catch (error) {
    console.log('error', error);
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add Forum', error.message);
  }
};

// @route PUT onlineForum/:id
// @desc update onlineForum by ID
exports.updateOnlineForum = async (req, res) => {
  try {
    const updatedOnlineForum = await OnlineForum.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOnlineForum) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Forum not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Forum Updated', updatedOnlineForum);
    // })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update Forum', error.message);
  }
};

// @route GET onlineForum/
// @desc get all onlineForums
exports.getAllOnlineForums = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = { is_deleted: false };
    if (req.query.search) {
      searchQuery = {
        title: {
          $regex: req.query.search,
          $options: 'i',
        },
        ...searchQuery,
      };
    }
    populate = [
      {
        path: 'postedBy',
        select: 'firstname lastname email image'
      }
    ];
    const onlineForums = await sendResponse(OnlineForum, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    const randomOnlineForums = await OnlineForum.aggregate([{ $match: { is_deleted: false } }, { $sample: { size: 5 } }]);
    return sendSuccessResponse(res, httpStatus.OK, 'Forum fetched', { onlineForums, randomOnlineForums });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Forum', error.message);
  }
};

// @route GET online-forum/my-forum
// @desc get My Forum
exports.getMyForums = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = { is_deleted: false, postedBy: req.user._id, };
    populate = [
      {
        path: 'postedBy',
        select: 'firstname lastname email image'
      }
    ];
    selectQuery = '-__v -is_deleted -is_active';
    const onlineForums = await sendResponse(OnlineForum, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Forum fetched', onlineForums);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch featured Forum', error.message);
  }
};

// @route GET online-forum/:id
// @desc get onlineForum by ID
exports.getOnlineForumById = async (req, res) => {
  try {
    const onlineForumId = req.params.id;
    const onlineForum = await OnlineForum.findById(onlineForumId).select('-__v -is_deleted -updatedAt')
      .populate({
        path: 'postedBy',
        select: 'firstname lastname email image'
      }).lean();
    if (!onlineForum) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Forum not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Forum fetched', onlineForum);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Forum', error.message);
  }
};

// @route GET online-forum/:onlineForum_slug
// @desc get onlineForum by onlineForum slug
exports.getOnlineForumBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const onlineForum = await OnlineForum.findOne({ slug: slug, is_deleted: false }).select('-__v -is_deleted -updatedAt')
      .lean();
    if (!onlineForum) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Forum not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Forum fetched', onlineForum);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Forum', error.message);
  }
};

// @route DELETE online-forum/:id
// @desc delete onlineForum by ID
exports.deleteOnlineForum = async (req, res) => {
  try {
    const deletedOnlineForum = await OnlineForum.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    if (!deletedOnlineForum) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Forum not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Forum Deleted');
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete Forum', error.message);
  }
};

// @route POST online-forum/add-comment/:id
// @desc Add Comment
exports.addComment = async (req, res) => {
  try {
    // const { error } = CommentForum.validate(req.body);

    // if (error) {
    //   sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add Forum', {}, error.message);
    // }

    const forum = req.params.forum;
    let commentData = {
      comment: req.body.comment,
      postedBy: req.user._id,
      forum: forum
    };
    ///check Forum
    console.log(forum);
    const onlineForum = await OnlineForum.findOne({
      _id: forum,
      is_deleted: false,
    });

    if (!onlineForum) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Forum Not Found');
    }

    let parentComment;

    if (req.body.parentComment) {
      //get Commnet
      parentComment = await CommentForum.findOne({
        is_deleted: false,
        _id: req.body.parentComment
      });

      if (!parentComment) {
        return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Parent Comment Not Found');
      }

      commentData = {
        ...commentData,
        parentComment: parentComment._id
      };
    }

    const comment = await CommentForum.create(commentData);
    if (parentComment) {
      parentComment.replies.push(comment._id);
      console.log(parentComment);
      await parentComment.save();
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Comment Added', comment);

  } catch (error) {
    console.log('error', error);
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add Comment', error.message);
  }
};

// @route PUT online-forum/update-comment/:comment
// @desc Update Comment
exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params;

    ///check Commentc
    const comment = await CommentForum.findOne({
      _id: commentId,
      is_deleted: false,
    });

    if (!comment) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Comment Not Found');
    }

    const updatedcomment = await CommentForum.findByIdAndUpdate(commentId,
      req.body, { new: true });
    return sendSuccessResponse(res, httpStatus.OK, 'Comment Added', updatedcomment);

  } catch (error) {
    console.log('error', error);
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to Update Comment', error.message);
  }
};

// @route get online-forum/comments/:forum
// @desc get Comment
exports.getComments = async (req, res) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    // searchQuery = { is_deleted: false, forum: req.params.forum, };
    selectQuery = '-__v -is_deleted -is_active';
    const comments = await CommentForum.aggregate([
      {
        $match: {
          is_deleted: false,
          parentComment: { $eq: null },
          forum: new mongoose.Types.ObjectId(req.params.forum),
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: 'postedBy'
        },
      },
      {
        $lookup: {
          from: 'comments',
          let: { replyIds: '$replies' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$replyIds']
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'postedBy',
                foreignField: '_id',
                as: 'postedBy'
              }
            }, {
              $project: {
                comment: 1,
                replies: 1,
                postedBy: {
                  firstname: 1,
                  lastname: 1,
                  email: 1,
                  image: 1
                },
                updatedAt: 1,
                createdAt: 1
              }
            }
          ],
          as: 'replies'
        }
      },
      {
        $project: {
          comment: 1,
          postedBy: {
            firstname: 1,
            lastname: 1,
            email: 1,
            image: 1
          },
          replies: {
            $slice: ["$replies", 0, 3]
          },
          repliesCount: {
            $size: "$replies",
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit * 1 },
      { $sort: sortQuery },
    ]);

    const totalComments = await CommentForum.countDocuments({
      is_deleted: false,
      parentComment: { $eq: null },
      forum: new mongoose.Types.ObjectId(req.params.forum),
    });
    const totalParentComment = await CommentForum.countDocuments({
      is_deleted: false,
      parentComment: { $eq: null },
      forum: new mongoose.Types.ObjectId(req.params.forum),
    });
    const totalPage = Math.ceil(totalParentComment / limit);
    // const onlineForums = await sendResponse(OnlineForum, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Comments fetched', { comments, totalComments, totalPage });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Comments', error.message);
  }
};

// @route POST comment/:id
// @desc Add Comment
exports.getReplies = async (req, res) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    // searchQuery = { is_deleted: false, parentComment: comment, };
    selectQuery = '-__v -is_deleted -is_active';
    const comments = await CommentForum.aggregate([
      {
        $match: {
          is_deleted: false,
          parentComment: new mongoose.Types.ObjectId(req.params.comment),
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: 'postedBy'
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'replies',
          foreignField: '_id',
          as: 'replies',
        }
      },
      {
        $project: {
          comment: 1,
          postedBy: {
            firstname: 1,
            lastname: 1,
            email: 1,
            image: 1
          },
          replies: {
            $slice: ["$replies", 0, 3]
          },
          repliesCount: {
            $size: "$replies",
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit * 1 },
        { $sort: sortQuery }
    ]);
    const totalComments = await CommentForum.countDocuments({
      is_deleted: false,
      parentComment: req.params.comment
    });
    const totalPage = Math.ceil(totalComments / limit);
    // const onlineForums = await sendResponse(OnlineForum, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Comments fetched', { comments, totalComments, totalPage });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch Replies', error.message);
  }
};

/// @route DELETE online-forum/comment/:id
// @desc delete onlineForum by ID
exports.deleteComment = async (req, res) => {
  try {
    const comment = await CommentForum.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    if (!comment) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Comment not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Comment Deleted');
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete Comment', error.message);
  }
};