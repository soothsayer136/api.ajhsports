const router = require('express').Router();
const controller = require('./booking.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addBlog);
router.put('/:id', controller.updateBlog);
// router.put('/remove-image/:id', verifyUser, controller.removeImage);
router.get('/', controller.getAllBlogs);
router.get('/featured-blog', controller.getFeaturedBlog);
router.get('/:id', controller.getBlogById);
router.delete('/:id', verifyUser, controller.deleteBlog);

module.exports = router;