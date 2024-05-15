const router = require('express').Router();
const controller = require('./notice.controller.js');
const { verifyUser } = require('../../middleware/auth');

router.get('/', verifyUser, controller.getNotice);
router.post('/mark-as-read/:noticeId', verifyUser, controller.markAsRead);

module.exports = router; 
