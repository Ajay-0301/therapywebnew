const router = require('express').Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, sessionController.getAllSessions);
router.get('/pending', authMiddleware, sessionController.getAllSessions);
router.get('/client/:clientId', authMiddleware, sessionController.getClientSessions);
router.get('/:id', authMiddleware, sessionController.getSessionById);
router.post('/', authMiddleware, sessionController.createSession);
router.put('/:id', authMiddleware, sessionController.updateSession);
router.delete('/:id', authMiddleware, sessionController.deleteSession);

module.exports = router;
