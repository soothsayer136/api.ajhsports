const httpStatus = require("http-status");
const { sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const Notice = require("./notice.model");
const { ObjectId } = require("mongodb");
const Match = require("../booking/match.model");
const userModel = require("../user/user.model");



exports.getNotice = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        searchQuery = {
            receiver: req.user._id
        };

        const data = await Notice.aggregate([
            {
                $match: {
                    receiver: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'sender',
                    as: 'sender'
                }
            },
            // {
            //     $lookup: {
            //         from: 'events',
            //         foreignField: '_id',
            //         localField: 'event',
            //         as: 'event'
            //     }
            // },
            {
                $unwind: { path: '$sender' }
            },
            // {
            //     $unwind: { path: '$event' }
            // },
            {
                $project: {
                    message: 1,
                    // event: {
                    //     eventName: 1,
                    //     eventSlug: 1,
                    //     eventDescription: 1,
                    //     startDate: 1,
                    //     endData: 1,
                    //     startTime: 1,
                    //     endTime: 1,
                    //     occurrence: 1,
                    //     location: 1
                    // },
                    event: 1,
                    sender: {
                        firstname: 1,
                        lastname: 1,
                        email: 1,
                        contact: 1
                    },
                    match: 1,
                    lesson: 1,
                    is_read: {
                        $cond: {
                            if: { $in: [req.user._id, '$read_by.readerId'] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 },
            { $sort: sortQuery },
        ]);
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

        const count = await Notice.countDocuments({ receiver: req.user._id }).lean();
        const totalPage = Math.ceil(count / limit);
        return sendSuccessResponse(res, httpStatus.OK, 'Notices', { data, count, totalPage });

    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { match } = req.body;

        let notice = await Notice.findOneAndUpdate({
            _id: req.params.noticeId,
            'read_by.readerId': { $ne: req.user._id }
        }, {
            $push: {
                read_by: {
                    readerId: req.user._id,
                    read_at: Date.now()
                }
            }
        });

        if (match) {
            switch(match){
                case 'challenge':
                    //create match
                    const match = await Match.create({
                        player1: req.user._id
                    })
                    //send challenge notice
                    await Notice.create({
                        match: match._id,
                        lesson: notice.lesson,
                        sender: req.user._id,
                        receiver: [ notice.sender ],
                        message: `Match Recommendation!! ${req.user.firstname} ${req.user.lastname} has challenged you for a match.`
                    })
                    break;
                case 'accept':
                    //accept challenge --- match fixed
                    await Match.findOneAndUpdate({
                        player1: notice.sender,
                        is_deleted: false
                    }, {
                        $set: {
                            player2: req.user._id
                        }
                    })

                    const sender = await userModel.findById(notice.sender)

                    //send challenge notice
                    await Notice.create({
                        sender: req.user._id,
                        receiver: [ notice.sender, req.user._id ],
                        message: `Match Confirmed!! 
                        Please Contact AJH for your match.
                        ${req.user.firstname} ${req.user.lastname} VS ${sender.firstname} ${sender.lastname}`
                    })
                    
                    break;
                case 'decline':
                    //accept challenge --- match fixed
                    await Match.findOneAndUpdate({
                        player1: notice.sender
                    }, {
                        $set: {
                            is_deleted: true
                        }
                    })
                    
                    //decline challenge --- delete match
                    break;
                case 'ignore':
                    //ignore challenge --- ignore
                    break;
            }
        }
        console.log(notice);
        return sendSuccessResponse(res, httpStatus.OK, 'Mark As Read', {});
    } catch (error) {
        next(error);
    }
};