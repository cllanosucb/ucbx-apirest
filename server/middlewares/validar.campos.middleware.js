const { error, success } = require('../controllers/respuestas.controller');
const {
    schemaLogin,
    schemaArrayCursos,
    schemaArrayListCursos
} = require('../schemas/schemas.yup');

const validarDatos = async(schema, body) => {
    try {
        let valid = await schema.isValid(body)
        let dataValidate = await schema.validate(body)
            // console.log("Resultado Validate ", dataValidate);
            // console.log("Validacion de Datos Body ", valid);
        if (!valid) {
            return error({ msg: "Formulario no Valido" });
        }

        return success({ msg: "Formulario Valido" })

    } catch (resperror) {
        return error({
            msg: "Formulario no Valido",
            error: resperror
        });
    }
}

const validarCamposLogin = async(req, res, next) => {
    const resValid = await validarDatos(schemaLogin, req.body);
    if (resValid.ok) {
        next()
    } else {
        res.status(400).json(resValid);
    }
};

const validarCamposArrayCursos = async(req, res, next) => {
    const resValid = await validarDatos(schemaArrayCursos, req.body);
    if (resValid.ok) {
        next()
    } else {
        res.status(400).json(resValid);
    }
};

const validarCamposListCursos = async(req, res, next) => {
    const resValid = await validarDatos(schemaArrayListCursos, req.body);
    if (resValid.ok) {
        next()
    } else {
        res.status(400).json(resValid);
    }
};

module.exports = {
    validarCamposLogin,
    validarCamposArrayCursos,
    validarCamposListCursos
}