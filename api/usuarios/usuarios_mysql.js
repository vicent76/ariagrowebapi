const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const usuarios_mysql = {
    test: async () => {
        return 'usuarios TEST'
    },
    login: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.usu()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from usuarios where login = '${data.usuario}' and passwordpropio = '${data.password}' AND nivelariagro >= 0`
            const [r] = await conn.query(sql)
            await conn.end()
            if (r.length == 0) {
                return null
            } else {
                return r[0]
            }
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    fichajes_corto: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
                SELECT * FROM menusweb AS m
                LEFT JOIN menusweb_usuarios AS mu ON mu.codigo = m.codigo
                WHERE mu.codusu = ${data.codusu}`
            const [r] = await conn.query(sql)
            await conn.end()
            return r
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    }

}

module.exports = usuarios_mysql