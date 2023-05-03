require('dotenv').config();
const xlsx = require('xlsx');
const express = require('express');
const db = require('../../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('../querys.controller');
const { error, success } = require('../respuestas.controller');
const { subirArchivo } = require('../../tools/fileupload.tool');
const { formatoFecha } = require('../../tools/util.tools');


module.exports = {
    
}