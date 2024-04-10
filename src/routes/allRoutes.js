const router = require('express').Router();

router.use('/contact', require('../modules/contact/contact.route'));
router.use('/user', require('../modules/user/user.route'));
router.use('/event', require('../modules/event/event.route'))

module.exports = router;
