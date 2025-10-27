const dotenv = require('dotenv')
dotenv.config()


router.get('/', (req, res) => {
    let entorno = {
        araw_port: ARAW_PORT,
        araw_empresa_id: ARAW_EMPRESA_ID,

        araw_winston_filelevel: ARAW_WINSTON_FILELEVEL,
        araw_winston_consolelevel: ARAW_WINSTON_CONSOLELEVEL,

        araw_mysql_server: ARAW_MYSQL_SERVER,
        araw_mysql_port: ARAW_MYSQL_PORT,
        araw_mysql_user: ARAW_MYSQL_USER,
        araw_mysql_password: ARAW_MYSQL_PASSWORD,
        araw_mysql_database: ARAW_MYSQL_DATABASE,
        argw_mysql_database_usuarios: ARGW_MYSQL_DATABASE_USUARIOS,

        araw_comparativa: ARAW_COMPARATIVA,
        araw_pedidos: ARAW_PEDIDOS,

        araw_demonio_delay: ARAW_DEMONIO_DELAY
    };

    res.json(entorno);
});

module.exports = router;