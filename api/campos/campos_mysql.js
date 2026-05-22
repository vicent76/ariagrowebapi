const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const productos_mysql = {
    test: async () => {
        return 'CAMPOS TEST'
    },
    campos_socio: async (codsocio) => {
        let conn = undefined;

        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `    
                SELECT
                s.nomsocio,
                c.codsocio,
                c.poligono, 
                c.parcela, 
                c.supsigpa,
                c.latitud,
                c.longitud,
                v.nomvarie,
                p.nomparti,
                pu.despobla AS nombrepueblo
                FROM rcampos AS c
                LEFT JOIN rsocios AS s ON s.codsocio = c.codsocio
                LEFT JOIN variedades AS v ON v.codvarie = c.codvarie 
                LEFT JOIN rpartida AS p ON p.codparti = c.codparti
                LEFT JOIN rpueblos AS pu ON pu.codpobla = p.codpobla
                WHERE c.codsocio = ${codsocio} AND c.fecbajas IS NULL
            `;
            let [result] = await conn.query(sql)
            await conn.end();
            const toNumber = (v) => {
                const n = Number(v);
                return isNaN(n) ? 0 : n;
            };
            let antpedid = null;
            let encontrado = false;
            let contador = 0;

            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].codigo) result[i].codigo = result[i].codigo.toString();
                    if (result[i].horacarga) result[i].horacarga = result[i].horacarga.toString();
                    result[i].kgs = toNumber(result[i].kgs);
                    result[i].numcajas = toNumber(result[i].numcajas);
                    result[i].totpalet = toNumber(result[i].totpalet);
                    result[i].kiloscaj = toNumber(result[i].kiloscaj);

                    // 🔽 NUEVA LÓGICA
                    let actual = result[i];
                    let anterior = i > 0 ? result[i - 1] : null;
                    let siguiente = i < result.length - 1 ? result[i + 1] : null;

                    let mismoPedidoAnterior = anterior && anterior.numpedid === actual.numpedid;
                    let mismoPedidoSiguiente = siguiente && siguiente.numpedid === actual.numpedid;

                    if (
                        actual.totpaletvista === 0 &&
                        siguiente && siguiente.totpaletvista === 0 &&
                        mismoPedidoSiguiente &&
                        (!mismoPedidoAnterior || anterior.totpaletvista !== 0)
                    ) {
                        actual.totpaletvista = 1;
                    }
                }
            }
            return result
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            let mensaje = error?.message || '';

            const regex = /Unknown column '.*' in 'field list'/;

            if (regex.test(mensaje)) {
                error.message = 'El usuario no tiene un identificador de mensajes correcto, consulte con administración.';
            }

            throw error;
        }
    },

    pedidos_observa: async (numpedid, numlinea) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
                SELECT * FROM pedidos_variedad_observa 
                WHERE numpedid = ${numpedid} AND numlinea = ${numlinea}
            `;
            const [result] = await conn.query(sql)
            await conn.end();
            return result
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },

    put_pedidos_observa_usu: async (numpedid, numlinea, mensAriagroPedidos) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
                UPDATE pedidos_variedad_observa 
                SET usu${mensAriagroPedidos} = 1
                WHERE numpedid = ${numpedid} AND numlinea = ${numlinea}
            `;
            const [result] = await conn.query(sql)
            await conn.end();
            return result
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    },

    put_pedidos_variedad: async (numpedid, numlinea, datos) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
                UPDATE pedidos_variedad 
                SET ?
                WHERE numpedid = ${numpedid} AND numlinea = ${numlinea}
            `;
            sql = mysql.format(sql, datos)
            const [result] = await conn.query(sql)
            await conn.end();
            return result
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    }
}


module.exports = productos_mysql