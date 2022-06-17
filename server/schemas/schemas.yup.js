const yup = require('yup');

const schemaLogin = yup.object().shape({
    usuario: yup.string().email().required(),
    clave: yup.string().min(8).required()
});

const schemaArrayCursos = yup.array().of(yup.object().shape({
    id_curso: yup.number().required(),
    nombre: yup.string().required(),
    descripcion: yup.string(),
    creditos: yup.number().nullable(true),
    organizacion: yup.string().required(),
    semestre: yup.string().nullable(true),
    fecha_inicio: yup.string().required(),
    fecha_fin: yup.string().required()
})).max(4, 'El tamaño del array debe ser maximo 4 objetos');

const schemaArrayListCursos = yup.array().of(yup.number()).max(4, 'El tamaño del array debe ser maximo 4 objetos');

module.exports = {
    schemaLogin,
    schemaArrayCursos,
    schemaArrayListCursos
}