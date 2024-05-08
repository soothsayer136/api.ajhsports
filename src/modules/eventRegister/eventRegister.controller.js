

// @route POST user/register

const httpStatus = require("http-status");
const { sendSuccessResponse, sendErrorResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const EventRegistration = require("./eventRegister.model");
const Joi = require("joi");
const Event = require("../event/event.model");
const userModel = require("../user/user.model");
const coachingModel = require("../coaching/coaching.model");
const bookingModel = require("../booking/booking.model");
const noticeModel = require("../notice/notice.model");

const eventJoiSchema = Joi.object({
    event: Joi.string().required()
});

const addNotice = async (lessons, event, user) => {
    const receiver = await bookingModel.distinct('user', {
        lesson: { $in: lessons },
        user: { $ne: user._id }
    });

    console.log(receiver);
    if (receiver.length > 0) {
        const _event = await Event.findById(event);
        await noticeModel.create({
            message: `${_event.eventName} is Recommended for you. Since, ${user.firstname} ${user.lastname} is going to the Event.`,
            event: event,
            receiver,
            sender: user._id
        });
    }
};

exports.addEventRegistration = async (req, res, next) => {
    try {

        const { error } = eventJoiSchema.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }
        console.log('req.user._id', req.user._id);
        //check Duplicates
        const is_duplicate = await EventRegistration.findOne({
            event: req.body.event,
            user: req.user._id,
            isDeleted: false
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Already Registered');
        }

        // Add Notice
        //Check if user is associated in any coaching sessions.
        const lesson = await bookingModel.distinct('lesson', {
            user: req.user._id
        });

        
        const event = await EventRegistration.create({ ...req.body, user: req.user._id });
        if (lesson.length > 0) {
            await addNotice(lesson, req.body.event, req.user);
        }
        return sendSuccessResponse(res, httpStatus.OK, 'EventRegistration Added', event);
    } catch (error) {
        console.log("err", error);
        next(error);
    }
};

exports.getEventRegistrations = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        if (req.query.event) {
            const event = await Event.findById(req.query.event);
            if (!event) {
                return sendErrorResponse(res, httpStatus.CONFLICT, 'Event Not Found');
            }
            searchQuery = {
                ...searchQuery,
                event: event._id
            };
        }
        populate = [
            {
                path: 'user',
                select: 'firstname lastname email contact'
            },
            {
                path: 'event',
                select: 'eventName eventSlug eventDescription startDate endData startTime endTime occurrence location'
            }
        ];
        selectQuery = '-isDeleted -__v';
        const eventRegistrations = await sendResponse(EventRegistration, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'Registered Users', eventRegistrations);
    } catch (error) {
        next(error);
    }
};

exports.getEventRegistration = async (req, res, next) => {
    try {
        const id = req.params.id;

        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        searchQuery = {
            ...searchQuery,
            event: id,
        };

        if (req.query.user) {
            //get User
            const user = await userModel.distinct('_id', {
                email: { $regex: req.query.user, $options: 'i' }
            });

            searchQuery = {
                ...searchQuery,
                user: { $in: user }
            };
        }

        populate = [
            {
                path: 'user',
                select: 'firstname lastname email contact'
            },
            {
                path: 'event',
                select: 'eventName eventSlug eventDescription startDate endData startTime endTime occurrence location'
            }
        ];
        selectQuery = '-isDeleted -__v';

        const eventRegistrations = await sendResponse(EventRegistration, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'EventRegistration', eventRegistrations);
    } catch (error) {
        next(error);
    }
};

exports.updateUserEventStatus = async (req, res, next) => {
    try {
        const { eventId, userId } = req.params;
        const registeredEvent = await EventRegistration.findOneAndUpdate({
            event: eventId,
            user: userId,
            isDeleted: false
        }, req.body, { new: true });
        return sendSuccessResponse(res, httpStatus.OK, 'Registration Updated', registeredEvent);
    } catch (error) {
        next(error);
    }
};

exports.deleteEventRegistration = async (req, res, next) => {
    try {
        await EventRegistration.findOneAndUpdate({
            _id: req.params.id
        }, {
            // isActive: false,
            isDeleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'EventRegistration Deleted');
    } catch (error) {
        next(error);
    }
};