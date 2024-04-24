const router = require('express').Router();
const controller = require('./booking.controller');
const { verifyUser, verifyAdmin } = require('../../middleware/auth');

// router.post('/', controller.addData);
router.post('/create-intent', verifyUser, controller.createPaymentIntent);
router.get('/payment-success/:id', controller.successPayment);
// router.post('/', verifyUser, controller.addBooking);
// router.put('/:id', controller.updateBlog);
router.get('/', verifyUser, verifyAdmin, controller.getAllBookings);
router.get('/my-booking', verifyUser, controller.getMyBooking);

module.exports = router;