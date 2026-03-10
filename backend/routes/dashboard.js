const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, dashboardController.getDashboardData);
router.get('/activity', authMiddleware, dashboardController.getRecentActivity);

module.exports = router;
