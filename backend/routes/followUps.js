const router = require('express').Router();
const followUpController = require('../controllers/followUpController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, followUpController.getAllFollowUps);
router.get('/pending', authMiddleware, followUpController.getPendingFollowUps);
router.get('/:id', authMiddleware, followUpController.getFollowUpById);
router.post('/', authMiddleware, followUpController.createFollowUp);
router.put('/:id', authMiddleware, followUpController.updateFollowUp);
router.delete('/:id', authMiddleware, followUpController.deleteFollowUp);
router.put('/:id/complete', authMiddleware, followUpController.markFollowUpComplete);

module.exports = router;
