require('./config/config');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//Uso de file-upload
app.use(fileUpload());
//Directorio publico
app.use(express.static('server/public'));
app.use(express.static(path.resolve(__dirname, 'uploads/paralelos')));
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
        msg: "Servidor UCBX iniciado"
    });
})

//Manejo de otras rutas
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
})

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
})