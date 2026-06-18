const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const variedades_mysql = {
    test: async () => {
        return 'VARIEDADES TEST'
    },
    todas_variedades: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from variedades`
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
    variedades_producto: async (codprodu) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select * from variedades WHERE codprodu = ${codprodu}`
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

    variedades_productos: async (list) => {
        let conn

        try {
            const cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sql = `
            SELECT *
            FROM variedades
            WHERE codprodu IN (?)
            Order by nomvarie ASC
        `

            const [r] = await conn.query(sql, [list])

            return r

        } catch (error) {
            throw (error)
        } finally {
            if (conn) {
                await conn.end()
            }
        }
    }
}


module.exports = variedades_mysql