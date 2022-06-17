require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/mariadb');
const { request, response } = require('express');
const { consulta } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const login = async(req = request, res = response) => {
    const { usuario, clave } = req.body;
    const sql = 'SELECT * FROM Datos WHERE usuario = ?';
    const resdb = await consulta(sql, [usuario]);
    if (!resdb.ok) {
        return res.status(500).json(error({
            msg: "Error interno del servidor",
            error: resdb.error
        }));
    }
    if (resdb.data.length == 0) {
        return res.status(400).json(error({
            msg: "Usuario o contraseña incorrectos"
        }));
    }
    if (!bcrypt.compareSync(clave, resdb.data[0].clave)) {
        return res.status(400).json(error({
            msg: "Usuario o contraseña incorrectos"
        }));
    }
    let token = jwt.sign({
        id_usuario: resdb.data[0].id_usuario,
        usuario: resdb.data[0].usuario
    }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_TOKEN });
    res.json(success({
        msg: "Inico sesión correctamente",
        token
    }));
}

const encriptar = (req = request, res = response) => {
    const { clave } = req.body;
    const encriptado = bcrypt.hashSync(clave, 10);
    res.json({
        clave,
        encriptado
    });
}

const revalidarToken = (req = request, res = response) => {
    let token = '';
    token = jwt.sign({
        id_usuario: req.id_usuario,
        usuario: req.usuario
    }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_TOKEN });

    res.json(success({
        msg: 'Token generado con exito',
        token
    }));
}

module.exports = {
    login,
    encriptar,
    revalidarToken
}