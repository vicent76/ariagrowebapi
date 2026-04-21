const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const productos_mysql = {
    test: async () => {
        return 'PRODUCTOS TEST'
    },
    pedidos_por_fecha: async (fecha, mensAriagroPedidos) => {
        let conn = undefined;

        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
              SELECT 
                    p.numpedid,
                    pv.numlinea,
                    CONCAT(pv.numpedid, '-', pv.numlinea) AS codigo,
                    (COALESCE(pv.numcajas, 0) * IF(COALESCE(pv.totpalet, 1) = 0, 1, COALESCE(pv.totpalet, 1)) * COALESCE(f.kiloscaj, 0)) AS kgs,
                    c.nomclien,
                    COALESCE(pv.totpalet, 0)  AS totpalet,
                    COALESCE(pv.totpalet, 0)  AS totpaletvista,
                    pv.codpalet,
                    pa.nompalet,
                    COALESCE(pv.numcajas, 0) * IF(COALESCE(pv.totpalet, 1) = 0, 1, COALESCE(pv.totpalet, 1)) AS numcajas,
                    COALESCE(f.kiloscaj, 0) AS kiloscaj,    
                    v.codvarie,
                    v.nomvarie,
                    CONCAT('(', f.codforfait,  ')',' ', f.nomconfe) AS confeccion,
                    ca.nomcalib,
                    p.refclien,
                    p.fechacar,
                    a.codtrans,
                    a.nomtrans,
                    a.teltrans,
                    p.matriveh,
                    p.matrirem,
                    al.numalbar,
                    COALESCE(pv.finalizado, 0) AS finalizado,
                    COALESCE(DATE_FORMAT(p.horacarga, '%H:%i'), '') AS horacarga,
                    COALESCE(obs.estadopalet, 0) AS estadopalet,
                    COALESCE(obs.hay_nueva, 0) AS hay_nueva

                FROM pedidos AS p
                LEFT JOIN pedidos_variedad AS pv ON pv.numpedid = p.numpedid
                LEFT JOIN pedidos_calibre AS pc ON pc.numpedid = pv.numpedid AND pc.numlinea = pv.numlinea

                -- Subquery: solo un registro por línea, sin duplicar
                LEFT JOIN (
                    SELECT 
                        po.numpedid,
                        po.numlinea,
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            WHEN SUM(COALESCE(po.usu${mensAriagroPedidos},0)) < COUNT(*) THEN 1
                            ELSE 2
                        END AS estadopalet,

                        -- ✔ NUEVA y NO leída por el usuario actual
                        MAX(
                            po.observaciones = '[NUEVO]' 
                            AND COALESCE(po.usu${mensAriagroPedidos},0) = 0
                        ) AS hay_nueva

                            FROM pedidos_variedad_observa po
                            GROUP BY po.numpedid, po.numlinea
                        ) AS obs
                        ON obs.numpedid = pv.numpedid 
                        AND obs.numlinea = pv.numlinea

                LEFT JOIN albaran AS al ON al.numpedid = p.numpedid
                LEFT JOIN clientes AS c ON c.codclien = p.codclien
                LEFT JOIN variedades AS v ON v.codvarie = pv.codvarie
                LEFT JOIN agencias AS a ON a.codtrans = p.codtrans
                LEFT JOIN forfaits AS f ON f.codforfait = pv.codforfait 
                LEFT JOIN confpale AS pa ON pa.codpalet = pv.codpalet
                LEFT JOIN calibres AS ca ON ca.codvarie = pc.codvarie AND ca.codcalib = pc.codcalib 
                WHERE p.fechacar = '${fecha}'
                AND al.numalbar IS NULL

                GROUP BY p.numpedid, pv.numlinea
                ORDER BY p.fechaped, p.numpedid, pv.numlinea, c.nomclien;
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