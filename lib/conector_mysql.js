const dotenv = require('dotenv')
const mysql = require('mysql2/promise')
dotenv.config()

const conectorMysql = {
    base: async () => {
        let configuracion = {
            host: process.env.ARAW_MYSQL_SERVER,
            port: process.env.ARAW_MYSQL_PORT,
            user: process.env.ARAW_MYSQL_USER,
            password: process.env.ARAW_MYSQL_PASSWORD,
            database: process.env.ARAW_MYSQL_DATABASE,
            decimalNumbers: true,
            timezone: "+00:00"
        }
        return configuracion
    },
    usu: async () => {
        let configuracion = {
            host: process.env.ARAW_MYSQL_SERVER,
            port: process.env.ARAW_MYSQL_PORT,
            user: process.env.ARAW_MYSQL_USER,
            password: process.env.ARAW_MYSQL_PASSWORD,
            database: process.env.ARGW_MYSQL_DATABASE_USUARIOS,
            decimalNumbers: true,
            timezone: "+00:00"
        }
        return configuracion
    },
    empresa: async (nomempre) => {
        let configuracion = {
            host: process.env.ARAW_MYSQL_SERVER,
            port: process.env.ARAW_MYSQL_PORT,
            user: process.env.ARAW_MYSQL_USER,
            password: process.env.ARAW_MYSQL_PASSWORD,
            database: nomempre,
            decimalNumbers: true,
            timezone: "+00:00"
        }
        return configuracion
    },

}

module.exports = conectorMysql