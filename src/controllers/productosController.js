const pool = require('../db');

// Lista pública: solo productos activos. Filtros opcionales: ?categoria=2&buscar=pizza
exports.listar = async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let sql = `SELECT p.*, c.nombre AS categoria
               FROM productos p
               LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
               WHERE p.activo = 1`;
    const params = [];

    if (categoria) {
      sql += ' AND p.id_categoria = ?';
      params.push(categoria);
    }
    if (buscar) {
      sql += ' AND p.nombre LIKE ?';
      params.push(`%${buscar}%`);
    }
    sql += ' ORDER BY p.nombre';

    const [filas] = await pool.query(sql, params);
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.listarCategorias = async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.obtener = async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.*, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       WHERE p.id_producto = ? AND p.activo = 1`,
      [req.params.id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(filas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Función de validación mejorada
const validar = ({ nombre, precio, stock }) => {
  if (!nombre || !nombre.trim()) return 'El nombre es obligatorio';
  if (nombre.length > 100) return 'El nombre es demasiado largo';
  
  if (precio === undefined || isNaN(precio) || Number(precio) <= 0) return 'El precio debe ser mayor a 0';
  
  if (stock === undefined || !Number.isInteger(Number(stock)) || Number(stock) < 0) return 'El stock no puede ser negativo';
  
  return null;
};

// CREAR PRODUCTO (Esta era la función que faltaba)
exports.crear = async (req, res) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const { id_categoria, nombre, descripcion, precio, imagen, stock } = req.body;

    const [resultado] = await pool.query(
      `INSERT INTO productos (id_categoria, nombre, descripcion, precio, imagen, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_categoria || null, nombre.trim(), descripcion || null, precio, imagen || null, stock]
    );
    res.status(201).json({ mensaje: 'Producto creado', id_producto: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// MODIFICAR PRODUCTO
exports.modificar = async (req, res) => {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const { id_categoria, nombre, descripcion, precio, imagen, stock } = req.body;

    const [resultado] = await pool.query(
      `UPDATE productos
       SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, imagen = ?, stock = ?
       WHERE id_producto = ?`,
      [id_categoria || null, nombre.trim(), descripcion || null, precio, imagen || null, stock, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ELIMINAR PRODUCTO (Lógica)
exports.eliminar = async (req, res) => {
  try {
    const [resultado] = await pool.query(
      'UPDATE productos SET activo = 0 WHERE id_producto = ?',
      [req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};