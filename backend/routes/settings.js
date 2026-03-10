const router = require('express').Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, settingsController.getUserSettings);
router.put('/', authMiddleware, settingsController.updateSettings);
router.post('/preferences', authMiddleware, settingsController.savePreferences);

module.exports = router;
