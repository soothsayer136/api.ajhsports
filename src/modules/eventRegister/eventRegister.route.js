const router = require('express').Router();
const controller = require('./eventRegister.controller.js');
const { verifyUser, verifyAdmin } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addEventRegistration);
router.put('/:eventId/:userId', verifyUser, controller.updateUserEventStatus);
router.get('/', verifyUser, verifyAdmin, controller.getEventRegistrations);
router.get('/:id', verifyUser, controller.getEventRegistration);
router.delete('/:id', verifyUser, verifyAdmin, controller.deleteEventRegistration);

module.exports = router; 
