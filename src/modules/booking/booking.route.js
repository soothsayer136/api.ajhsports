const router = require('express').Router();
const controller = require('./booking.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/create-intent', controller.createPaymentIntent);
router.post('/', verifyUser, controller.addBooking);
// router.put('/:id', controller.updateBlog);
router.get('/', controller.getAllBookings);
router.get('/:id', controller.getBookingById);
router.delete('/:id', verifyUser, controller.deleteBooking);

module.exports = router;