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
    inscripcionesPracticasEstudiantesPregrado,
    crearDocentesPostgrado,
    asignarParalelosDocentesPostgrado,
    crearEstudiantesPostgrado,
    retirosEstudiantesPostgrado,
    inscripcionesEstudiantesPostgrado
} = require('../controllers/usuariosPregrado.controller');
const {
    crearDocentesMoodle
} = require('../controllers/moodle/usuarios.moodle.controller');

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

/*
POSTGRADO
*/
app.post('/crearDocentesPostgrado', verificarToken, crearDocentesPostgrado);

app.post('/asignarParalelosDocentesPostgrado', verificarToken, asignarParalelosDocentesPostgrado);

app.post('/crearEstudiantesPostgrado', verificarToken, crearEstudiantesPostgrado);

app.post('/retirosEstudiantesPostgrado', verificarToken, retirosEstudiantesPostgrado);

app.post('/inscripcionesEstudiantesPostgrado', verificarToken, inscripcionesEstudiantesPostgrado);
/*
POSTGRADO
*/

/** MOODLE */
app.post('/moodle/crearDocentesMoodle', verificarToken, crearDocentesMoodle);

//app.post('/moodle/asignarParalelosDocentesMoodle', verificarToken, asignarParalelosDocentesMoodle);

//app.post('/moodle/crearEstudiantesMoodle', verificarToken, crearEstudiantesMoodle);

//app.post('/moodle/retirosEstudiantesMoodle', verificarToken, retirosEstudiantesMoodle);

//app.post('/moodle/inscripcionesEstudiantesMoodle', verificarToken, inscripcionesEstudiantesMoodle);
/** MOODLE */

module.exports = app;