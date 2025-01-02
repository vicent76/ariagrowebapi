const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const incidencias_mysql = {
    test: async () => {
        return 'INCIDENCIAS TEST'
    },
    todas_incidencias: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from incidencias`
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

module.exports = incidencias_mysql