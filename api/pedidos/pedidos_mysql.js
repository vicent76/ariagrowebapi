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
                    IF(COALESCE(pv.totpalet, 1) = 0, 1, COALESCE(pv.totpalet, 1)) AS totpalet,
                    pv.codpalet,
                    pa.nompalet,
                    COALESCE(pv.numcajas, 0) AS numcajas,
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
                            po.observaciones = '[NUEVA]' 
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
            const [result] = await conn.query(sql)
            await conn.end();
            const toNumber = (v) => {
                const n = Number(v);
                return isNaN(n) ? 0 : n;
            };

            if (result.length > 0) {
                for (let r of result) {
                    if (r.codigo) r.codigo = r.codigo.toString();
                    if (r.horacarga) r.horacarga = r.horacarga.toString();
                    r.kgs = toNumber(r.kgs);
                    r.numcajas = toNumber(r.numcajas);
                    r.totpalet = toNumber(r.totpalet);
                    r.kiloscaj = toNumber(r.kiloscaj);
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