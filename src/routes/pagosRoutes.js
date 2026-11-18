const router = require('express').Router();
const { confirmar } = require('../controllers/pagosController');
const { verificarToken } = require('../middlewares/auth');

router.post('/confirmar', verificarToken, confirmar);

module.exports = router;