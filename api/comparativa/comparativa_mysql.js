const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_comparativa: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from clientes`
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

module.exports = clientes_mysql