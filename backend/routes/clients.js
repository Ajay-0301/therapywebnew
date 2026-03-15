const router = require('express').Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, clientController.getAllClients);
router.get('/deleted', authMiddleware, clientController.getDeletedClients);
router.delete('/deleted/:id', authMiddleware, clientController.deleteDeletedClient);
router.get('/:id', authMiddleware, clientController.getClientById);
router.post('/', authMiddleware, clientController.createClient);
router.put('/:id', authMiddleware, clientController.updateClient);
router.delete('/:id', authMiddleware, clientController.deleteClient);
router.post('/:id/session', authMiddleware, clientController.addSession);

module.exports = router;
