require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/db');

const app = express();

const origenesPermitidos = [
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    // sin origin = Postman, curl, etc.
    if (!origin || origenesPermitidos.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/productos', require('./src/routes/productosRoutes'));
app.use('/api/pedidos', require('./src/routes/pedidosRoutes'));
app.use('/api/pagos', require('./src/routes/pagosRoutes'));

// Ruta de prueba para confirmar que la base conecta
app.get('/api/salud', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS productos FROM productos');
    res.json({ ok: true, ...rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));