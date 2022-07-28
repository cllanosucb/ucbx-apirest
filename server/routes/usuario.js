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
    asignarParalelosDocentesPregrado
} = require('../controllers/usuariosPregrado.controller');

app.post('/registarporcursos', verificarToken, validarCamposListCursos, registrarUsuariosPorCurso);

app.get('/portoken', verificarToken, usuarioPorToken);

app.get('/obtenerMenuPorUsuario', verificarToken, obtenerMenuPorUsuario);

app.post('/crearDocentesPregrado', verificarToken, crearDocentesPregrado);

app.post('/asignarParalelosDocentesPregrado', verificarToken, asignarParalelosDocentesPregrado);

module.exports = app;