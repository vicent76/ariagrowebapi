const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'CLIENTES TEST'
    },
    todos_clientes: async (data) => {
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
    },

    buscar_clientes_nombre: async (nombre, empresa) => {
        let conn = undefined

        try {
            const cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                    *
                    FROM clientes
                    WHERE nomclien LIKE ?
                    ORDER BY nomclien
            `;

            const [result] = await conn.query(sql, [`%${nombre}%`])

            await conn.end()
            return result
        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    }
}


module.exports = clientes_mysql