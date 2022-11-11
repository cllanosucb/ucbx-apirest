const express = require('express');
const app = express();

// Ejemplo
// app.use('/persona', require('./persona'));
app.use('/login', require('./login'));
app.use('/usuarios', require('./usuario'));
app.use('/cursos', require('./curso'));
app.use('/modulos', require('./modulos'));
app.use('/tareas', require('./tarea'));
app.use('/calificaciones', require('./calificacion'));
app.use('/subir', require('./upload'));
app.use('/semestres', require('./semestres'));
app.use('/retiros', require('./retiros'));
app.use('/encuestas', require('./encuestas_nova'));

module.exports = app;