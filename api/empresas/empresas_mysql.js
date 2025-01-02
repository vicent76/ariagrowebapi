const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const empresas_mysql = {
    test: async () => {
        return 'EMPRESAS TEST'
    },
    empresa: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.usu()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from empresasariagro WHERE ariagroweb = 1`
            const [r] = await conn.query(sql)
            if (r.length === 0) return {NomEmpresa: 'DESCONOCIDA'}
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

module.exports = empresas_mysql