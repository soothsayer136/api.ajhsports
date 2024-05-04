const router = require('express').Router();
const controller = require('./onlineForum.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addOnlineForum);
router.get('/my-forum', verifyUser, controller.getMyForums);
router.get('/forums', controller.getAllOnlineForums);
router.get('/:id', controller.getOnlineForumById);
router.put('/:id', controller.updateOnlineForum);
// router.put('/remove-image/:id', verifyUser, controller.removeImage);
// router.get('/:id', verifyUser, controller.getOnlineForumById);
router.delete('/:id', verifyUser, controller.deleteOnlineForum);


//comments
router.post('/add-comment/:forum', verifyUser, controller.addComment)
router.put('/update-comment/:comment', verifyUser, controller.updateComment)
router.get('/comments/:forum', controller.getComments)
router.get('/replies/:comment', controller.getReplies)
router.delete('/comment/:comment', verifyUser, controller.deleteComment)
module.exports = router;
