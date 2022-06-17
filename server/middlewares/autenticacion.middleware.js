require('dotenv').config();
const jwt = require('jsonwebtoken');
const { error, success } = require('../controllers/respuestas.controller');

let verificarToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED_JWT, (err, decoded) => {
        if (err) {
            return res.status(401).json(error({
                msg: 'Token invalido',
                err
            }));
        }
        req.datos = decoded;
        next();
    });
};

let validarToken = (req, res, next) => {
    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json(error({ msg: 'Error en el Token' }))
    }
    try {
        const decoded = jwt.verify(token, process.env.SEED_JWT);
        req.id_usuario = decoded.id_usuario;
        req.usuario = decoded.usuario;
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json(error({ msg: 'Token no valido' }))
        }
        var decoded = jwt.decode(token, { complete: true });
        req.id_usuario = decoded.payload.id_usuario;
        req.usuario = decoded.payload.usuario;
    }
    next();
};

module.exports = {
    verificarToken,
    validarToken
}