  const express = require('express');
  const router = express.Router();
  const dbConnection = require('../core/db_config');
  const moment = require('moment');
  const { verifyToken, verifyTokenAndAuthorization } = require('./verifyToken');
  
  router.get('/perfil/:codCliente', verifyTokenAndAuthorization, async (req, res) => {
    const codCliente = req.params.codCliente;
    const sql = 'SELECT * FROM cliente WHERE codCliente = ?';
  
    try {
      const connection = await dbConnection();
      const [results] = await connection.query(sql, [codCliente]);
      connection.release();
  
      if (results.length === 0) {
        res.status(404).json({ error: 'Perfil de usuario no encontrado' });
      } else {
        const perfilUsuario = results[0];
        res.json(perfilUsuario);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
  router.put('/perfil/:codCliente', verifyTokenAndAuthorization, async (req, res) => {
    const codCliente = req.params.codCliente;
    const updatedFields = req.body;
  
    // Verificar si el perfil de usuario existe antes de realizar la actualización
    const checkProfileQuery = 'SELECT * FROM cliente WHERE codCliente = ?';
  
    try {
      const connection = await dbConnection();
      const [results] = await connection.query(checkProfileQuery, [codCliente]);
  
      if (results.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
      }
  
      // Construir la consulta de actualización y los valores dinámicamente
      let updateProfileQuery = 'UPDATE cliente SET ';
      const updateValues = [];
  
      for (const key in updatedFields) {
        updateProfileQuery += `${key} = ?, `;
        updateValues.push(updatedFields[key]);
      }
  
      updateProfileQuery = updateProfileQuery.slice(0, -2); // Eliminar la última coma y espacio
  
      updateProfileQuery += ' WHERE codCliente = ?';
      updateValues.push(codCliente);
  
      // Realizar la actualización del perfil de usuario
      const [updateResults] = await connection.query(updateProfileQuery, updateValues);
      connection.release();
  
      // Si la actualización se realiza correctamente, puedes enviar una respuesta exitosa
      return res.json({ message: 'Perfil de usuario actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  

  module.exports = router;
  