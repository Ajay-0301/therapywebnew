const router = require('express').Router();
const earningController = require('../controllers/earningController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, earningController.getAllEarnings);
router.get('/month', authMiddleware, earningController.getEarningsByMonth);
router.post('/', authMiddleware, earningController.addEarning);
router.put('/:id', authMiddleware, earningController.updateEarning);
router.delete('/:id', authMiddleware, earningController.deleteEarning);
router.post('/save-all', authMiddleware, earningController.saveEarnings);

module.exports = router;
