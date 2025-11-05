const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    try {
        let entorno = {
            araw_port: process.env.ARAW_PORT,
            araw_empresa_id: process.env.ARAW_EMPRESA_ID,

            araw_winston_filelevel: process.env.ARAW_WINSTON_FILELEVEL,
            araw_winston_consolelevel: process.env.ARAW_WINSTON_CONSOLELEVEL,

            araw_mysql_server: process.env.ARAW_MYSQL_SERVER,
            araw_mysql_port: process.env.ARAW_MYSQL_PORT,
            araw_mysql_user: process.env.ARAW_MYSQL_USER,
            araw_mysql_password: process.env.ARAW_MYSQL_PASSWORD,
            araw_mysql_database: process.env.ARAW_MYSQL_DATABASE,
            argw_mysql_database_usuarios: process.env.ARGW_MYSQL_DATABASE_USUARIOS,

            araw_comparativa: process.env.ARAW_COMPARATIVA,
            araw_pedidos: process.env.ARAW_PEDIDOS,
            araw_refresco: process.env.ARAW_REFRESCO,
        };

        res.json(entorno);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;