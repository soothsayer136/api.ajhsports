const CoachingLesson = require('./coaching.model');
const upload = require('../../upload/upload');
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');

const coachingJoiSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      private: Joi.number().min(1),
      group: Joi.number().min(1)
    })
  ),
  time: Joi.string().required(),
  interval: Joi.number().required(),
  location: Joi.string().required(),
  expertiseLevel: Joi.string().required(),
});

// @route POST coaching/
// @desc add coaching
exports.addCoaching = async (req, res) => {
  upload.single('image')(req, res, async error => {

    if (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Error during file upload');
    }
    try {
      if (typeof req.body.price === 'string') {
        req.body.price = JSON.parse(req.body.price);
      }
      const { error } = coachingJoiSchema.validate(req.body);

      if (error) {
        sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add coaching', {}, error.message);
      }

      const checkCoachingExists = await CoachingLesson.findOne({ title: req.body.title, is_deleted: false });
      if (checkCoachingExists) {
        sendErrorResponse(res, httpStatus.CONFLICT, 'Coaching with this title Already Exists', {});
      }

      //add path
      if (req.file) req.body.image = req.file.path.split('uploads')[1];

      const coaching = await CoachingLesson.create({ ...req.body });
      return sendSuccessResponse(res, httpStatus.OK, 'Coaching Added', coaching);
      // })
    } catch (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add coaching', error.message);
    }
  });
};

// @route PUT coaching/:id
// @desc update coaching by ID
exports.updateCoaching = async (req, res) => {
  upload.single('image')(req, res, async error => {
    try {
      //add path
      if (req.file) {
        req.body.image = req.file.path.split('uploads')[1];
      }

      if (typeof req.body.price === 'string') {
        req.body.price = JSON.parse(req.body.price);
      }

      const updatedCoaching = await CoachingLesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedCoaching) {
        return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Coaching not found');
      }
      return sendSuccessResponse(res, httpStatus.OK, 'Coaching Updated', updatedCoaching);
      // })
    } catch (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update coaching', error.message);
    }
  });
};

// @route PUT coaching/change-status/:id
// @desc change coaching feature status
// exports.changeFeatureStatus = async (req, res) => {
//   try {
//     const checkCoaching = await Coaching.findOne({ _id: req.params.id, is_deleted: false });
//     if (!checkCoaching) {
//       res.json({
//         success: false,
//         message: 'Coaching not found',
//         // error: error.message
//       });
//     }
//     const coaching = await Coaching.findByIdAndUpdate(req.params.id, { $set: { is_featured: req.body.status } }, { new: true });
//     return sendSuccessResponse(res, httpStatus.OK, 'Coaching feature status changed', coaching);
//   } catch (error) {
//     return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to change coaching status', error.message);
//   }
// };

// @route GET coaching/
// @desc get all coachings
exports.getAllCoachings = async (req, res, next) => {
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
    const coachings = await sendResponse(CoachingLesson, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Coaching fetched', coachings);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch coaching', error.message);
  }
};

// @route GET coaching/featured-coaching
// @desc get all featured coachings
exports.getFeaturedCoaching = async (req, res) => {
  try {
    const coachings = await CoachingLesson.find({
      is_deleted: false,
      is_featured: true,
    });
    return sendSuccessResponse(res, httpStatus.OK, 'Coaching fetched', coachings);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch featured coaching', error.message);
  }
};

// @route GET coaching/:id
// @desc get coaching by ID
exports.getCoachingById = async (req, res) => {
  try {
    const coachingId = req.params.id;
    const coaching = await CoachingLesson.findOne({ _id: coachingId, is_deleted: false }).select('-__v -is_deleted -updatedAt')
      .lean();
    if (!coaching) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Coaching not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Coaching fetched', coaching);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch coaching', error.message);
  }
};

// @route GET coaching/:coaching_slug
// @desc get coaching by coaching slug
exports.getCoachingBySlug = async (req, res) => {
  try {
    const coaching_slug = req.params.coaching_slug;
    const coaching = await CoachingLesson.findOne({ coaching_slug: coaching_slug, is_deleted: false }).select('-__v -is_deleted -updatedAt')
      .lean();
    if (!coaching) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Coaching not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Coaching fetched', coaching);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch coaching', error.message);
  }
};

// @route DELETE coaching/:id
// @desc delete coaching by ID
exports.deleteCoaching = async (req, res) => {
  try {
    const deletedCoaching = await CoachingLesson.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    if (!deletedCoaching) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Coaching not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Coaching Deleted');
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete coaching', error.message);
  }
};
