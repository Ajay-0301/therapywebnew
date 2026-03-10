const router = require('express').Router();
const insightsController = require('../controllers/insightsController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, insightsController.getInsightsData);
router.get('/stats', authMiddleware, insightsController.getClientsStats);
router.get('/age-distribution', authMiddleware, insightsController.getAgeDistribution);
router.get('/earnings', authMiddleware, insightsController.getEarningsStats);

module.exports = router;
