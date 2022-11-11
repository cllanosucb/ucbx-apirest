const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');

const {
    excelEncuestas,
    desactivarMaterias,
    activarMaterias
} = require('../controllers/encuestas.nova.controller')

app.put('/cargarExcel', verificarToken, excelEncuestas);

app.get('/desactivarMaterias/estudiantes',verificarToken, desactivarMaterias);

app.get('/activarMaterias/estudiantes',verificarToken, activarMaterias);

//app.get('/buscar', verificarToken, buscarCurso);

//app.get('/lista', verificarToken, listaCursos);

//app.post('/guardar', verificarToken, validarCamposArrayCursos, guardarCurso);

//app.post('/crearPlantillasPregrado', verificarToken, crearPlantillasPregrado);

//app.post('/crearParalelosPregrado', verificarToken, crearParalelosPregrado);

module.exports = app;