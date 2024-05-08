const Booking = require('./booking.model');
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');
const { default: Stripe } = require('stripe');
const coachingModel = require('../coaching/coaching.model');
console.log('ev',process.env.STRIPE_KEY)
const stripe = require('stripe')(process.env.STRIPE_KEY);

const bookingJoiSchema = Joi.object({
  lesson: Joi.string().required(),
  lesson_name: Joi.string().required(),
  lesson_type: Joi.string().required(),
  price: Joi.number().required()
});

//payment
exports.createPaymentIntent = async (req, res, next) => {
  try {
    // const customer = await stripe.customers.create({
    //   email: 'testingPayment@gmail.com'
    // })
    const { error } = await bookingJoiSchema.validate(req.body);
    if (error) {
      sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Booking Failed', {}, error.message);
    }

    const { lesson, lesson_name, lesson_type, price } = req.body;
    const getBooking = await Booking.findOne({
      lesson: lesson,
      user: req.user._id
    });
    if (getBooking) return sendErrorResponse(res, httpStatus.CONFLICT, 'Booking Already Done');

    const getLesson = await coachingModel.findById(lesson);
    if (!getLesson) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Lesson Not Found');

    const lessonPriceIndex = getLesson.price.findIndex(val => val.name === lesson_name);
    //check Lesson Name
    if (lessonPriceIndex === -1) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Lesson Price Not found');

    const booking = await Booking.create({
      user: req.user._id,
      lesson: getLesson._id,
      price,
      lesson_name,
      lesson_type,
    });
    const lineItems = [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: getLesson.title,
          },
          unit_amount: price * 100,
        },
        quantity: 1

      }
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:${process.env.PORT}/api/booking/payment-success/${booking._id}`,
      cancel_url: "http://localhost:3000/failure",
    });
    // if(session.id){
    //   booking.is_payed = true
    //   await booking.save()
    // }
    res.json({ id: session.id, url: session.url });

    // paymentIntent.create({
    //   amount: req.body.amount,
    //   currency: 'aud'
    // })
    // res.json({ clientSecret: customer });
  } catch (error) {
    next(error);
  }
};

exports.successPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Booking Not Found');
    booking.is_payed = true;
    await booking.save();
    return res.redirect(301, 'http://localhost:3000/success');
  } catch (error) {
    next(error);
  }
};

// @route GET booking/
// @desc get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = { is_deleted: false };
    if(req.query.lesson){
      const lesson = await coachingModel.findById(req.query.lesson)
      if(!lesson){
          return sendErrorResponse(res, httpStatus.CONFLICT, 'Event Not Found');
      }
      searchQuery = {
          ...searchQuery,
          lesson: lesson._id
      }
  }
    populate = [
      {
        path: 'user',
        select: 'firstname lastname email contact'
      },
      {
        path: 'lesson',
        select: 'title image description slug price'
      }
    ];
    selectQuery = '-__v -is_deleted -updatedAt';
    // if (req.query.search) {
    //   searchQuery = {
    //     title: {
    //       $regex: req.query.search,
    //       $options: 'i',
    //     },
    //     ...searchQuery,
    //   };
    // }
    const bookings = await sendResponse(Booking, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Booking fetched', bookings );
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch booking', error.message);
  }
};

// @route GET booking/my-booking
// @desc get my booking
exports.getMyBooking = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = {
      user: req.user._id,
      is_payed: true,
      is_deleted: false
    };
    populate = [
      {
        path: 'user',
        select: 'firstname lastname email contact'
      },
      {
        path: 'lesson',
        select: 'title image description slug price'
      }
    ];
    selectQuery = '-__v -is_deleted -updatedAt';
    const bookings = await sendResponse(Booking, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Booking fetched', bookings);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch booking', error.message);
  }
};
