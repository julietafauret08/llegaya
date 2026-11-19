const router = require('express').Router();
const { 
  login, 
  registro, 
  perfil, 
  solicitarRecuperacion, 
  restablecerPassword,
  actualizarPerfil // <--- ESTA ES LA LÍNEA QUE FALTABA
} = require('../controllers/authController');

const { verificarToken } = require('../middlewares/auth');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);
router.post('/recuperar-password', solicitarRecuperacion);
router.post('/restablecer-password', restablecerPassword);

// Rutas privadas
router.get('/perfil', verificarToken, perfil);
router.put('/perfil', verificarToken, actualizarPerfil); 

module.exports = router;