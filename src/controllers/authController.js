const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const crearToken = (usuario) =>
  jwt.sign(
    { id: usuario.id_usuario, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, direccion } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Completá nombre, apellido, email y contraseña' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailLimpio = email.trim().toLowerCase();

    const [existe] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [emailLimpio]
    );
    if (existe.length > 0) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, telefono, direccion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido.trim(), emailLimpio, hash, telefono || null, direccion || null]
    );

    res.status(201).json({ mensaje: 'Usuario registrado', id_usuario: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresá email y contraseña' });
    }

    const [filas] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (filas.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = filas[0];
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    res.json({
      token: crearToken(usuario),
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.perfil = async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT id_usuario, nombre, apellido, email, telefono, direccion, rol
       FROM usuarios WHERE id_usuario = ?`,
      [req.usuario.id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(filas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};