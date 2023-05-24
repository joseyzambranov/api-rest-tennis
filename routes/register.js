const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const  Cliente  = require('../models/Clientes'); // Asumiendo que tienes un modelo llamado Cliente
const nodemailer = require('nodemailer');

// Ruta de registro
router.post('/', [
  check('numDocumento').notEmpty().withMessage('El número de documento es requerido'),
  check('nombres').notEmpty().withMessage('El nombre es requerido'),
  check('email').notEmpty().withMessage('El correo electrónico es requerido').isEmail().withMessage('El correo electrónico no es válido'),
  check('telefono').notEmpty().withMessage('El número de teléfono es requerido'),
  check('password').notEmpty().withMessage('La contraseña es requerida').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  check('passwordConfirmation').notEmpty().withMessage('La confirmación de contraseña es requerida').custom((value, { req }) => value === req.body.password).withMessage('La confirmación de contraseña no coincide'),
  check('tipo_documento').notEmpty().withMessage('El tipo de documento es requerido'),
  check('primer_apellido').notEmpty().withMessage('El primer apellido es requerido'),
  check('segundo_apellido').notEmpty().withMessage('El segundo apellido es requerido'),
  check('nivel').notEmpty().withMessage('El nivel es requerido'),
  check('posicion').notEmpty().withMessage('El nivel es requerido'),
  check('genero').notEmpty().withMessage('El nivel es requerido'),
  //check('fecha_nacimiento').notEmpty().withMessage('El fecha de nacimiento es requerido'),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }


  try {
    const { 
            numDocumento,
            nombres,
            email,
            telefono,
            password,
            tipo_documento,
            primer_apellido,
            segundo_apellido,
            nivel,
            posicion,
            genero,
            /*fecha_nacimiento*/
          } = req.body;

    // Verificar si el cliente ya está registrado
   const existingCliente = await Cliente.findOne( { email } );
   if (existingCliente) {
     return res.status(400).json({ error: 'El cliente ya está registrado' });
   }

    // Crear una instancia del cliente
    const clienteData = {
        numDocumento,
        nombres,
        email,
        telefono,
        password: await bcrypt.hash(password, 10),
        estado: 'ACTIVO',
        tipo: 'CLIENTE',
        creacion: new Date().toISOString(),
        tipo_documento,
        primer_apellido,
        segundo_apellido,
        nivel,
        posicion,
        genero,
        /*fecha_nacimiento*/
      };
      const clienteId = await Cliente.create(clienteData);
      // Envío del correo electrónico
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'systemdevsperu@gmail.com',
        pass: 'bnsbburpfymjxqar',
      },
    });
    var mailOptions = {
      from: 'systemdevsperu@gmail.com',
      to: email, // Utilizamos el correo del usuario registrado como destinatario
      subject: 'Registro exitoso',
      html: `
    <h1>¡Gracias por registrarte en nuestro sitio web!</h1>
    <p>Bienvenido/a ${nombres}!</p>
    <p>Tu cuenta ha sido registrada exitosamente.</p>
    <p>Para comenzar a utilizar nuestros servicios, por favor verifica tu cuenta siguiendo las instrucciones a continuación:</p>
    <ol>
      <li>Ingresa a nuestro sitio web <a href="https://surcotenis.pe/">surcotenis.pe</a></li>
    </ol>
    <p>Gracias nuevamente por unirte a nosotros. ¡Esperamos que disfrutes de tu experiencia en nuestro sitio web!</p>
    <p>Saludos,</p>
    <p>El equipo surcotenis</p>
  `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el envío del correo electrónico' });
      } else {
        console.log('Email enviado');
        return res.status(200).json({ success: 'Registrado exitosamente. Se ha enviado un correo electrónico de confirmación.' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el registro' });
  }
});

//    return res.status(200).json({ success: 'Registrado exitosamente' });
//  } catch (error) {
//    console.error(error);
//    return res.status(500).json({ error: 'Error en el registro' });
//  }
//});

module.exports = router;



