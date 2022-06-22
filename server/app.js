require('./config/config');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const app = express();

//Directorio publico
app.use(express.static('server/public'));
//Usar cors
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());
//Configuracion global de rutas
app.use('/api', require('./routes/index'));

app.get('/api', (req, res) => {
    res.json({
        msg: "Servidor UCBONLINE iniciado"
    });
})

//Manejo de otras rutas
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
})

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
})