const router = require('express').Router();
const patientLogController = require('../controllers/patientLogController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, patientLogController.getAllPatientLogs);
router.post('/', authMiddleware, patientLogController.createPatientLog);
router.put('/:id', authMiddleware, patientLogController.updatePatientLog);
router.delete('/:id', authMiddleware, patientLogController.deletePatientLog);

module.exports = router;
