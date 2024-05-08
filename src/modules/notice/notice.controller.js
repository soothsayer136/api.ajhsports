const httpStatus = require("http-status");
const { sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const Notice = require("./notice.model");



exports.getNotice = async (req, res, next)=>{
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        searchQuery = {
            receiver: req.user._id
        }

        populate = [
            {
                path: 'sender',
                select: 'firstname lastname email contact'
            },
            {
                path: 'event',
                select: 'eventName eventSlug eventDescription startDate endData startTime endTime occurrence location'
            }
        ];

        selectQuery = '-__v -receiver -read_by';

        const notices = await sendResponse(Notice, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'Notices', notices);

    } catch (error) {
        next(error)
    }
}

exports.markAsRead = async (req, res, next) => {
    try {
        await Notice.findOneAndUpdate({
            _id: req.params.noticeId,
            'read_by.readerId': req.user._id
        }, {
            $push: {
                read_by: {
                    readerId: req.user._id,
                    read_at: Date.now()
                }
            }
        })

        return sendSuccessResponse(res, httpStatus.OK, 'Mark As Read', {});
    } catch (error) {
        next(error)
    }
}