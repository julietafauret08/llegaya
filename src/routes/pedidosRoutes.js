const router = require('express').Router();
const ctrl = require('../controllers/pedidosController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

router.post('/', verificarToken, ctrl.crear);
router.get('/mios', verificarToken, ctrl.misPedidos); // antes de '/:id'
router.get('/', verificarToken, soloAdmin, ctrl.listarTodos);
router.get('/:id', verificarToken, ctrl.obtener);
router.put('/:id/estado', verificarToken, soloAdmin, ctrl.cambiarEstado);

module.exports = router;