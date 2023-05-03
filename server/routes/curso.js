const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    buscarCurso,
    listaCursos,
    guardarCurso
} = require('../controllers/curso.controller');
const {
    validarCamposArrayCursos
} = require('../middlewares/validar.campos.middleware');
const {
    crearPlantillasPregrado,
    crearParalelosPregrado,
    crearPlantillasPracticasPregrado,
    crearParalelosPracticasPregrado,
    crearPlantillasPostgrado,
    crearParalelosPostgrado
} = require('../controllers/asignaturasPregrado.controller');

const {
    //nombreFuncion
} = require('../controllers/moodle/asignaturas.moodle.controller');

app.get('/buscar', verificarToken, buscarCurso);

app.get('/lista', verificarToken, listaCursos);

app.post('/guardar', verificarToken, validarCamposArrayCursos, guardarCurso);

app.post('/crearPlantillasPregrado', verificarToken, crearPlantillasPregrado);

app.post('/crearParalelosPregrado', verificarToken, crearParalelosPregrado);

app.post('/crearPlantillasPracticasPregrado', verificarToken, crearPlantillasPracticasPregrado);

app.post('/crearParalelosPracticasPregrado', verificarToken, crearParalelosPracticasPregrado);

/*
POSTGRADO
*/
app.post('/crearPlantillasPostgrado', verificarToken, crearPlantillasPostgrado);

app.post('/crearParalelosPostgrado', verificarToken, crearParalelosPostgrado);
/*
POSTGRADO
*/

/** MOODLE */
//app.post('/moodle/crearParalelosMoodle', verificarToken, crearParalelosMoodle);
/** MOODLE */

module.exports = app;