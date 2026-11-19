const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../db');

const crearToken = (usuario) =>
  jwt.sign(
    { id: usuario.id_usuario, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

exports.registro = async (req, res) => {
  try {
    // 1. Extraemos las variables primero
    const { nombre, apellido, email, password, telefono, direccion } = req.body;

    // 2. Validaciones
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Completá nombre, apellido, email y contraseña' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }
    
    if (telefono && !/^\d+$/.test(telefono)) {
      return res.status(400).json({ error: 'El teléfono solo debe contener números' });
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

    // 3. Enviar correo de bienvenida (Lo envolvemos en try/catch para que no falle el registro si falla el correo)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"LlegaYa" <no-reply@llegaya.com>',
        to: emailLimpio,
        subject: '¡Bienvenido/a a LlegaYa! 🛵',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px;">
            <h1 style="color: #e63946;">¡Hola, ${nombre.trim()}!</h1>
            <p style="font-size: 16px; color: #4b5563;">
              Tu cuenta en LlegaYa fue creada con éxito. A partir de ahora vas a poder pedir tu comida favorita y recibirla en la puerta de tu casa.
            </p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" style="background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ir a la tienda
              </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af;">Si no creaste esta cuenta, por favor ignorá este mensaje.</p>
          </div>
        `
      });
    } catch (errorCorreo) {
      console.error("Error al enviar correo de bienvenida:", errorCorreo);
      // No cortamos la ejecución, el usuario ya se guardó en la BD
    }

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

exports.solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;
  try {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
    if (filas.length === 0) return res.status(404).json({ error: 'El email no está registrado' });

    const usuario = filas[0];
    const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `${process.env.FRONTEND_URL}/restablecer-password/${token}`;

    await transporter.sendMail({
      from: '"LlegaYa" <no-reply@llegaya.com>',
      to: email,
      subject: 'Recuperación de contraseña - LlegaYa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e63946;">Hola, ${usuario.nombre}</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña en LlegaYa.</p>
          <p>Hacé clic en el siguiente botón para crear una nueva (válido por 1 hora):</p>
          <a href="${link}" style="display: inline-block; background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Restablecer contraseña</a>
          <p>Si no fuiste vos, podés ignorar este correo.</p>
        </div>
      `
    });

    res.json({ mensaje: 'Correo enviado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

exports.restablecerPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;
  
  if (!nuevaPassword || nuevaPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = await bcrypt.hash(nuevaPassword, 10);

    await pool.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hash, decoded.id]);
    
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'El enlace es inválido o expiró' });
  }
};

exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion } = req.body;
    const id_usuario = req.usuario.id;

    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'El nombre y apellido son obligatorios' });
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id_usuario = ?',
      [nombre.trim(), apellido.trim(), telefono || null, direccion || null, id_usuario]
    );

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};