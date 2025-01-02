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
            let sql = `select * from usuarios where login = '${data.usuario}' and passwordpropio = '${data.password}' AND nivelariagro = 0`
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
            let sql = `select 
                e.*,
                DATE_FORMAT(HoraReal, '%H:%i:%s') AS HoraRealS, DATE_FORMAT(e.Fecha, '%Y-%m-%d') AS FechaS,
                i.NomInci 
                from entradafichajes as e
                left join usuarios as t on t.usuarioId = e.usuarioId 
                left join incidencias as i on i.IdInci = e.idInci 
                where t.codigo = ${data.codigo}
                order by e.Fecha DESC, e.HoraReal DESC
                limit 10`
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
    fichajes_agrupado: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `select 
                    e.Fecha,
                    GROUP_CONCAT(HoraReal ORDER BY HoraReal SEPARATOR ', ') AS Horas
                    from entradafichajes as e
                    left join usuarios as t on t.usuarioId = e.usuarioId
                    where t.codigo = ${data.codigo}
                    group by e.Fecha 
                    order by e.Fecha desc
                    limit 10`
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
    crear_fichaje: async (data) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            // Primero comprobamos que el usuario existe y no está dado de baja
            let sql = `select * from usuarios where usuarioId = ${data.usuarioId}`
            const [r] = await conn.query(sql)
            if (r.length == 0) throw(new Error(`El usuario no existe`))
            let usuario = r[0]
            if (usuario.FecBaja) throw(new Error(`El usuario esta dado de baja`))
            // Ahora hay que obtener un nuevo número de secuencia
            sql = "SELECT COALESCE(MAX(Secuencia) + 1, 1) AS ID FROM entradafichajes"
            const [r1] = await conn.query(sql)
            data.Secuencia = r1[0].ID
            // Y ahora insertamos el nuevo fichaje
            await conn.query('INSERT INTO entradafichajes SET ?', data)
            await conn.end()
            return data
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    fichajes_fecha: async (data) => {
        let conn = undefined
        try {
            let conn = undefined
            try {
                let cfg = await connector.base()
                conn = await mysql.createConnection(cfg)
                let sql = `select 
                    e.*,
                    DATE_FORMAT(HoraReal, '%H:%i:%s') AS HoraRealS, DATE_FORMAT(e.Fecha, '%Y-%m-%d') AS FechaS,
                    i.NomInci 
                    from entradafichajes as e
                    left join usuarios as t on t.usuarioId = e.usuarioId 
                    left join incidencias as i on i.IdInci = e.idInci 
                    where t.codigo = ${data.codigo} and e.Fecha = '${data.fecha}'
                    order by e.HoraReal ASC
                    limit 10`
                const [r] = await conn.query(sql)
                await conn.end()
                return r
            } catch (error) {
                if (conn) {
                    await conn.end()
                }
                throw (error)
            }
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },
    fichajes_unico: async (data) => {
        let conn = undefined
        try {
            let conn = undefined
            try {
                let cfg = await connector.base()
                conn = await mysql.createConnection(cfg)
                let sql = `select 
                    e.*,
                    DATE_FORMAT(HoraReal, '%H:%i:%s') AS HoraRealS, DATE_FORMAT(e.Fecha, '%Y-%m-%d') AS FechaS,
                    i.NomInci 
                    from entradafichajes as e
                    left join usuarios as t on t.usuarioId = e.usuarioId 
                    left join incidencias as i on i.IdInci = e.idInci 
                    where e.Secuencia = ${data.secuencia}`
                const [r] = await conn.query(sql)
                await conn.end()
                if (r.length === 0) return null
                return r[0]
            } catch (error) {
                if (conn) {
                    await conn.end()
                }
                throw (error)
            }
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    }

}

module.exports = usuarios_mysql