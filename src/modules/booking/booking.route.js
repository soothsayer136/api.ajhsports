const router = require('express').Router();
const controller = require('./booking.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/create-intent', verifyUser, controller.createPaymentIntent);
// router.get('/payment-success/:id', verifyUser, controller.createPaymentIntent);
// router.post('/', verifyUser, controller.addBooking);
// router.put('/:id', controller.updateBlog);
router.get('/', controller.getAllBookings);
router.get('/:id', controller.getBookingById);
router.delete('/:id', verifyUser, controller.deleteBooking);

module.exports = router;