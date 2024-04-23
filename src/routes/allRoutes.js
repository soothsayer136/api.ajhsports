const router = require('express').Router();

router.use('/contact', require('../modules/contact/contact.route'));
router.use('/user', require('../modules/user/user.route'));
router.use('/event', require('../modules/event/event.route'))
router.use('/blog', require('../modules/blog/blog.route'))
router.use('/coaching', require('../modules/coaching/coaching.route'))
router.use('/booking', require('../modules/booking/booking.route'))
router.use('/event-register', require('../modules/eventRegister/eventRegister.route'))

module.exports = router;
