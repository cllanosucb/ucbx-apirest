require('dotenv').config();
const db = require('../db/mariadb');
const fs = require('fs');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const { formatoFecha, transformarNomRegional, formatoFechaNeo, otroFormatoFecha } = require('../tools/util.tools');

const generarCsvPlantillas = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const id_semestre = req.query.id_semestre;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves)
    }
    const datosAsignaturas = await listaAsignaturasPorSemeste(id_semestre);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas)
    }
    const ruta = generarPlantillas(datosAsignaturas.data, req.get('host'), id_semestre, user);
    if (!ruta.ok) {
        return res.status(500).json(ruta);
    }
    res.json(ruta);
}

const llavesPorUsuario = async(id_usuario) => {
    const sqlLlavePorUsuario = `select distinct l.url_instancia, l.api_key
    from rolusu ru, Llaves l, Roles r
    where ru.id_llave = l.id_llave and ru.id_rol = r.id_rol
    and r.id_instancia = 2 and ru.id_usuario = ?`;
    const resultLlaves = await consulta(sqlLlavePorUsuario, [id_usuario]);
    if (!resultLlaves.ok) {
        return error({
            msg: "Error interno del servidor",
            error: resultLlaves.error.error
        })
    }
    if (resultLlaves.data.length == 0) {
        return error({
            msg: "No tienes un apikey asignado para proceder",
            error: null
        })
    }
    return success(resultLlaves.data);
}

const listaAsignaturasPorSemeste = async(id_semestre) => {
    const sqlAsignaturasPorSemestre = `select *
    from Datos_asignaturas
    where id_semestre = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre]);
    return resultAsignaturas;
}

generarPlantillas = (lista, host, user, id_semestre) => {
    let plantillas = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15\nnombre,fecha_inicio,fecha_fin,creditos,semestre,curse_code,idioma,zona_horaria,mostrar_catalogo,categoria_catalogo,plantilla,inscribirse,dar_baja,desactivados,organizacion\n";
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].paralelo_nuevo) {
            if (!plantillas.includes(generarDatosPlantillaNeo(lista[i]))) {
                plantillas = plantillas + generarDatosPlantillaNeo(lista[i]) + "\n";
            }
        }
    }
    try {
        const date = new Date();
        const archivo = `plantillas/p${otroFormatoFecha(date, 'DD-MM-YYYY-HH-mm-ss')}-${user}-${id_semestre}.csv`;
        fs.writeFileSync(`csv/${archivo}`, plantillas);
        const ruta = `${host}/csv/${archivo}`;
        return success({
            msg: "Generacion de plantillas CSV",
            ruta
        });
    } catch (err) {
        console.log(err);
        return error({
            msg: "Error al crear el archivo CSV",
            error: err
        });
    }
}

generarDatosPlantillaNeo = (p) => {
    nombre = `Plantilla: ${p.materia_sigla} ${p.materia_nombre.replace(/,/g, '')}`;
    fecha_inicio = formatoFechaNeo(p.semestre_fecha_inicio);
    fecha_fin = formatoFechaNeo(p.semestres_fecha_fin);
    creditos = p.paralelo_num_creditos;
    semestre = p.semestre_resumido;
    codigo_curso = `${p.id_regional}.${p.id_materia}.${p.id_docente}`;
    idioma = 'Español';
    zona_horaria = 'La Paz';
    mostrar_catalogo = true;
    categoria_catalogo = p.carrera_nombre != null ? p.carrera_nombre.replace(/,/g, '') : '';
    plantilla = true;
    inscribirse = false;
    dar_baja = false;
    desactivados = false;
    organizacion = transformarNomRegional(p.nombre_regional);
    return `${nombre},${fecha_inicio},${fecha_fin},${creditos},${semestre},${codigo_curso},${idioma},${zona_horaria},${mostrar_catalogo},${categoria_catalogo},${plantilla},${inscribirse},${dar_baja},${desactivados},${organizacion}`;
}

module.exports = {
    generarCsvPlantillas
}