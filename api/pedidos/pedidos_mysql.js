const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const productos_mysql = {
    test: async () => {
        return 'PRODUCTOS TEST'
    },
    pedidos_por_fecha: async (fecha) => {
        let conn = undefined
        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)
            let sql = `
               SELECT 
                p.numpedid,
                pv.numlinea,
                CONCAT(pv.numpedid, '-', pv.numlinea) AS codigo,
                (pv.numcajas * pv.totpalet * f.kiloscaj) AS kgs,

                c.nomclien,
                pv.totpalet,
                pv.codpalet,
                pa.nompalet,
                pv.numcajas,
                f.kiloscaj,
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
                COALESCE(DATE_FORMAT(p.horacarga, '%H:%i'), '') AS horacarga,
                

                IF (COALESCE(po.observaciones,'')<>'',

                IF(SUM(COALESCE(po.usu3,0))=0,1,2)
                , 0) estadopalet

                FROM pedidos AS p
                LEFT JOIN pedidos_variedad AS pv ON pv.numpedid = p.numpedid
                LEFT JOIN pedidos_calibre AS pc ON pc.numpedid = pv.numpedid AND pc.numlinea = pv.numlinea
                LEFT JOIN pedidos_variedad_observa AS po ON po.numpedid = pv.numpedid AND po.numlinea = pv.numlinea

                LEFT JOIN albaran AS al ON al.numpedid = p.numpedid
                LEFT JOIN clientes AS c ON c.codclien = p.codclien
                LEFT JOIN variedades AS v ON v.codvarie = pv.codvarie
                LEFT JOIN agencias AS a ON a.codtrans = p.codtrans
                LEFT JOIN forfaits AS f ON f.codforfait = pv.codforfait 
                LEFT JOIN confpale AS pa ON pa.codpalet = pv.codpalet
                LEFT JOIN calibres AS ca ON ca.codvarie = pc.codvarie AND ca.codcalib = pc.codcalib 
                WHERE p.fechacar = '${fecha}'
                GROUP BY p.numpedid,pv.numlinea
                ORDER BY p.fechaped, p.numpedid, c.nomclien
            `;
            const [result] = await conn.query(sql)
            await conn.end();
            if (result.length > 0) {
                for (let r of result) {
                    r.codigo = r.codigo.toString();
                    r.horacarga = r.horacarga.toString();
                }
            }
            return result
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
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
    }
}

module.exports = productos_mysql