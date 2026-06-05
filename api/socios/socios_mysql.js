const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const socios_mysql = {
    test: async () => {
        return 'CLIENTES TEST'
    },
    buscar_socios_nombre: async (nombre) => {
        let conn = undefined

        try {
            const cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                    codsocio,
                    nomsocio
                FROM rsocios
                WHERE fechabaja IS NULL
                    AND nomsocio LIKE ?
                ORDER BY nomsocio
            `

            const [result] = await conn.query(sql, [`%${nombre}%`])

            await conn.end()
            return result
        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    }
}

module.exports = socios_mysql