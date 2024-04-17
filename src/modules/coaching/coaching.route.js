const router = require('express').Router();
const controller = require('./coaching.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addCoaching);
router.put('/:id', controller.updateCoaching);
router.get('/', controller.getAllCoachings);
router.get('/:id', controller.getCoachingById);
router.delete('/:id', controller.deleteCoaching);

module.exports = router;