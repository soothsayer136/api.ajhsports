const Booking = require('./booking.model');
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');
const { default: Stripe } = require('stripe');
const coachingModel = require('../coaching/coaching.model');
const stripe = require('stripe')('sk_test_51OlkLnGxYrincDprqd6Ur9s5Svo1Aqe03SD48vkm6AdWkpt8bItk0g9JhKAlIz6PNMSaMOlbfBNQRwpnEzKkqmsw00R4Y5bQg8');

const bookingJoiSchema = Joi.object({
  user: Joi.string().required(),
  lesson: Joi.string().required()
});

//payment
exports.createPaymentIntent = async (req, res, next) => {
  try {
    // const customer = await stripe.customers.create({
    //   email: 'testingPayment@gmail.com'
    // })

    const {lesson, lesson_name, lesson_type, price} = req.body;
    const getLesson = await coachingModel.findById(lesson)
    if(!getLesson) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Lesson Not Found');

    const lessonPriceIndex = getLesson.price.findIndex(val => val.name === lesson_name)
    //check Lesson Name
    if(lessonPriceIndex === -1) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Lesson Price Not found');

    const booking = await Booking.create({
      user: req.user._id,
      lesson: getLesson._id,
      price,
      lesson_name,
      lesson_type,
    })
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
    ]
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:8888/success/",
      cancel_url: "http://localhost:3000/cancel",
    });
    if(session.url){
      booking.is_payed = true
      await booking.save()
    }
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

// exports.successPayment = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//     if(!booking) return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Booking Not Found');
//     booking.is_payed = true
//     await booking.save()
//     res.send()
//   } catch (error) {
//     next(error);
//   }
// }

// @route POST booking/
// @desc add booking
exports.addBooking = async (req, res) => {
  upload.single('image')(req, res, async error => {

    if (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Error during file upload');
    }
    try {
      const { error } = bookingJoiSchema.validate(req.body);

      if (error) {
        sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add booking', {}, error.message);
      }

      const checkBookingExists = await Booking.findOne({ title: req.body.title, is_deleted: false });
      if (checkBookingExists) {
        sendErrorResponse(res, httpStatus.CONFLICT, 'Your Booking Already Exist', {});
      }

      //add path
      req.body.image = req.file.path.split('uploads')[1];

      const booking = await Booking.create({ ...req.body });
      return sendSuccessResponse(res, httpStatus.OK, 'Booking Added', booking);
      // })
    } catch (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add booking', error.message);
    }
  });
};

// @route PUT booking/:id
// @desc update booking by ID
exports.updateBooking = async (req, res) => {
  upload.single('image')(req, res, async error => {
    try {
      //add path
      if (req.file) {
        req.body.image = req.file.path.split('uploads')[1];
      }

      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBooking) {
        return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Booking not found');
      }
      return sendSuccessResponse(res, httpStatus.OK, 'Booking Updated', updatedBooking);
      // })
    } catch (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update booking', error.message);
    }
  });
};

// @route GET booking/
// @desc get all bookings
exports.getAllBookings = async (req, res, next) => {
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
    const bookings = await sendResponse(Booking, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Booking fetched', { bookings, randomBookings });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch booking', error.message);
  }
};

// @route GET booking/:id
// @desc get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).select('-__v -is_deleted -updatedAt')
      .lean();
    if (!booking) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Booking not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Booking fetched', booking);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch booking', error.message);
  }
};

// @route DELETE booking/:id
// @desc delete booking by ID
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    if (!deletedBooking) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Booking not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Booking Deleted');
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete booking', error.message);
  }
};
