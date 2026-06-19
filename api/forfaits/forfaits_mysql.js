const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const forfaits_mysql = {
    test: async () => {
        return 'FORFAITS TEST'
    },
    todos_forfaits: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from forfaits`
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

    buscar_forfaits_nombre: async (nombre, empresa) => {
        let conn = undefined

        try {
            const cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                    *
                    FROM forfaits
                    WHERE nomconfe LIKE ?
                    ORDER BY nomconfe
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


module.exports = forfaits_mysql