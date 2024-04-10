const router = require('express').Router();
const controller = require('./event.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addEvent);
router.get('/',  controller.getEvents);
router.get('/:slug',  controller.getEvent);
router.put('/:slug', controller.updateEvents);
router.delete('/:slug', controller.deleteEvent);

module.exports = router; 
