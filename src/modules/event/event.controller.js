

// @route POST user/register

const httpStatus = require("http-status");
const { sendSuccessResponse, sendErrorResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const Event = require("./event.model");
const Joi = require("joi");

const eventJoiSchema = Joi.object({
    eventName: Joi.string().required(),
    eventDescription: Joi.string().required(),
    startDate: Joi.string().optional(),
    endDate: Joi.string().optional(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    occurrence: Joi.array().required(),
    location: Joi.string().required(),
});

const slug = async (eventName) => {
    const formattedName = eventName.replace(/[0-9+\-*\/@$#%&!^`~{}\[\]()<>]/g, ' ').replace(/\s+/g, '_'); // Replace spaces with underscores
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const slug = formattedName.toLowerCase() + '_' + randomNum;
    const checkslug = await Event.findOne({
        eventSlug: slug,
        isDeleted: false,
    });
    if (checkslug) await this.slug(eventName);
    
    return slug;
};

exports.addEvent = async (req, res, next) => {
    try {

        const { error } = eventJoiSchema.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }
        //check Duplicates
        const is_duplicate = await Event.findOne({
            eventName: req.body.eventName,
            isDeleted: false
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Event Already Exist');
        }

        //generate eventSlug
        req.body.eventSlug = await slug(req.body.eventName);

        const event = await Event.create(req.body);
        return sendSuccessResponse(res, httpStatus.OK, 'Event Added', event);
    } catch (error) {
        console.log("err", error);
        next(error);
    }
};

exports.getEvents = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        if (req.query.search) {
            searchQuery = {
                ...searchQuery,
                eventName: { $regex: req.query.search, $options: 'i' }
            };
        }
        if (req.query.isActive !== undefined && req.query.isActive !== null && req.query.isActive !== "") {
            searchQuery = {
                ...searchQuery,
                isActive: req.query.isActive 
            };
        }
        selectQuery = '-isDeleted -__v'
        console.log("search")
        const events = await sendResponse(Event, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'All Events', events);
    } catch (error) {
        next(error);
    }
};

exports.getEvent = async (req, res, next) => {
    try {
        const eventSlug = req.params.slug

        const event = await Event.findOne({
            eventSlug,
            isDeleted: false
        }).select('-isDeleted -__v')
        return sendSuccessResponse(res, httpStatus.OK, 'Event', event);
    } catch (error) {
        next(error);
    }
};

exports.updateEvents = async (req, res, next) => {
    try {
        //check Duplicates
        const is_duplicate = await Event.findOne({
            eventName: req.body.eventName,
            eventSlug: { $ne: req.params.slug },
            isDeleted: false
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Event Already Exist`);
        }
        //generate eventSlug
        req.body.eventSlug = await slug(req.body.eventName);
        
        const event = await Event.findOneAndUpdate({
            eventSlug: req.params.slug
        }, req.body, { new: true });
        return sendSuccessResponse(res, httpStatus.OK, 'Event Updated', event);
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        await Event.findOneAndUpdate({
            eventSlug: req.params.slug
        }, {
            // isActive: false,
            isDeleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Event Deleted');
    } catch (error) {
        next(error);
    }
};