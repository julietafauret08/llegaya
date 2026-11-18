const router = require('express').Router();
const ctrl = require('../controllers/productosController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

router.get('/categorias', ctrl.listarCategorias); // va antes de '/:id'
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

router.post('/', verificarToken, soloAdmin, ctrl.crear);
router.put('/:id', verificarToken, soloAdmin, ctrl.modificar);
router.delete('/:id', verificarToken, soloAdmin, ctrl.eliminar);

module.exports = router;