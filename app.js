const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const winston = require('./winston')
const cors = require('cors')
const path = require('path')
const moment = require('moment')

dotenv.config()

const app = express()

const appServer = {
    crearServidor: ()=>{
        winston.warn('Crear Servidor');
        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(express.static(__dirname + '/www'));
        app.use('/api/version', require('./api/version/version_controlador'));
        app.use('/api/usuarios', require('./api/usuarios/usuarios_controlador'));
        app.use('/api/incidencias', require('./api/incidencias/incidencias_controlador'));
        app.use('/api/empresas', require('./api/empresas/empresas_controlador'));

        //
        app.use('/api/productos', require('./api/productos/productos_controlador'));
        app.use('/api/variedades', require('./api/variedades/variedades_controlador'));
        app.use('/api/clientes', require('./api/clientes/clientes_controlador'));
        app.use('/api/comparativa', require('./api/comparativa/comparativa_controlador'));

        app.use((req, res, next) => {
            res.sendFile(path.join(__dirname,"www", "index.html"));
        });

        app.use((error, req, res, next) => {
            res.status(error.status || 500);
            let mensaje = error.message;
            if (error.response && error.response.data) {
                mensaje += ` Code(${error.response.data.errorCode}) ${error.response.data.message}`
            }
            res.json({
                error: {
                    message: mensaje
                }
            });
        });
    },
    lanzarServidor: ()=>{
        winston.warn('Lanzar Servidor');
        const port = process.env.ARAW_PORT || 49170
        winston.warn(`Servidor ARIPRESWEB-API escuchando en puerto: ${port}`)
       app.listen(port, () => {})
    }
}

module.exports = appServer