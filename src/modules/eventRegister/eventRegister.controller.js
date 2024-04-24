

// @route POST user/register

const httpStatus = require("http-status");
const { sendSuccessResponse, sendErrorResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const EventRegistration = require("./eventRegister.model");
const Joi = require("joi");
const Event = require("../event/event.model");

const eventJoiSchema = Joi.object({
    event: Joi.string().required()
});

exports.addEventRegistration = async (req, res, next) => {
    try {

        const { error } = eventJoiSchema.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }
        console.log('req.user._id', req.user._id)
        //check Duplicates
        const is_duplicate = await EventRegistration.findOne({
            event: req.body.event,
            user: req.user._id,
            isDeleted: false 
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Already Registered');
        }

        const event = await EventRegistration.create({...req.body, user: req.user._id});
        return sendSuccessResponse(res, httpStatus.OK, 'EventRegistration Added', event);
    } catch (error) {
        console.log("err", error);
        next(error);
    }
};

exports.getEventRegistrations = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        if(req.query.event){
            const event = await Event.findById(req.query.event)
            if(!event){
                return sendErrorResponse(res, httpStatus.CONFLICT, 'Event Not Found');
            }
            searchQuery = {
                ...searchQuery,
                event: event._id
            }
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
        selectQuery = '-isDeleted -__v'
        const eventRegistrations = await sendResponse(EventRegistration, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'Registered Users', eventRegistrations);
    } catch (error) {
        next(error);
    }
};

exports.getEventRegistration = async (req, res, next) => {
    try {
        const id = req.params.id

        const event = await EventRegistration.findOne({
            _id: id,
            isDeleted: false
        }).select('-isDeleted -__v').populate([
            {
              path: 'user',
              select: 'firstname lastname email contact'
            },
            {
              path: 'event',
              select: 'eventName eventSlug eventDescription startDate endData startTime endTime occurrence location'
            }
          ])
        return sendSuccessResponse(res, httpStatus.OK, 'EventRegistration', event);
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