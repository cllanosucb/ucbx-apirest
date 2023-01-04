const express = require('express');
const app = express();
const { verificarToken } = require('../middlewares/autenticacion.middleware');
const {
    validarCamposListCursos
} = require('../middlewares/validar.campos.middleware');
const {
    registrarUsuariosPorCurso,
    usuarioPorToken,
    obtenerMenuPorUsuario
} = require('../controllers/usuarios.controller');

const {
    crearDocentesPregrado,
    asignarParalelosDocentesPregrado,
    crearEstudiantesPregrado,
    retirosEstudiantesPregrado,
    inscripcionesEstudiantesPregrado,
    inscripcionesEstudiantesPregradoCsv,
    crearDocentesPracticasPregrado,
    asignarParalelosPracticasDocentesPregrado,
    crearEstudiantesPregradoPractica,
    retirosEstudiantesPracticasPregrado,
    inscripcionesPracticasEstudiantesPregrado
} = require('../controllers/usuariosPregrado.controller');

app.post('/registarporcursos', verificarToken, validarCamposListCursos, registrarUsuariosPorCurso);

app.get('/portoken', verificarToken, usuarioPorToken);

app.get('/obtenerMenuPorUsuario', verificarToken, obtenerMenuPorUsuario);

app.post('/crearDocentesPregrado', verificarToken, crearDocentesPregrado);

app.post('/asignarParalelosDocentesPregrado', verificarToken, asignarParalelosDocentesPregrado);

app.post('/crearEstudiantesPregrado', verificarToken, crearEstudiantesPregrado);

app.post('/retirosEstudiantesPregrado', verificarToken, retirosEstudiantesPregrado);

app.post('/inscripcionesEstudiantesPregrado', verificarToken, inscripcionesEstudiantesPregrado);

app.post('/inscripcionesEstudiantesPregradoCsv', verificarToken, inscripcionesEstudiantesPregradoCsv);

app.post('/crearDocentesPracticasPregrado', verificarToken, crearDocentesPracticasPregrado);

app.post('/asignarParalelosPracticasDocentesPregrado', verificarToken, asignarParalelosPracticasDocentesPregrado);

app.post('/crearEstudiantesPregradoPractica', verificarToken, crearEstudiantesPregradoPractica);

app.post('/retirosEstudiantesPracticasPregrado', verificarToken, retirosEstudiantesPracticasPregrado);

app.post('/inscripcionesPracticasEstudiantesPregrado', verificarToken, inscripcionesPracticasEstudiantesPregrado);

module.exports = app;