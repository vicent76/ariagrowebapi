const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const socios_mysql = {
    test: async () => {
        return 'CLIENTES TEST'
    },
    buscar_socios_nombre: async (nombre, empresa) => {
        let conn = undefined

        try {
            const cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                    codsocio,
                    nomsocio,
                    nrorea,
                    nrosiex,
                    nroasociado
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
    },

    buscar_situaciones: async (empresa) => {
        let conn = undefined

        try {
            const cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                   * from rsituacion
            `

            const [result] = await conn.query(sql)

            await conn.end()
            return result
        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    }
}

module.exports = socios_mysql