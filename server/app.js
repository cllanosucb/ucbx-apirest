require('./config/config');
require('dotenv').config();
const cors = require('cors')
const express = require('express');
const app = express();

//Usar cors
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());
//Configuracion global de rutas
app.use('/api', require('./routes/index'));

app.get('/', (req, res) => {
    res.json({
        msg: "Servidor UCBONLINE iniciado"
    });
})

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
})