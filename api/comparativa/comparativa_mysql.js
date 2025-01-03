const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_comparativa: async (data) => {
        let conn = undefined;
        var obj = {
            nomempre: null
        }
        let arr = [];
        try {
            for (let d of data.empresas) {
                console.log(`empresa: ${d.ariagro}`);
                let cfg = await connector.empresa(d.ariagro);
                conn = await mysql.createConnection(cfg)
                let sql = `select av.totpalet, av.numcajas, av.pesoneto from albaran_variedad av`;
                sql += ` LEFT JOIN albaran as a ON a.numalbar = av.numalbar`;
                sql += ` LEFT JOIN variedades AS v ON v.codvarie = av.codvarie`;
                sql += ` WHERE 1 = 1`;
                if(data.variedad) {
                    sql += ` AND av.codvarie = ${data.variedad}`;
                }
                if(data.producto) {
                    sql += ` AND v.codprodu = ${data.producto}`;
                }
                if(data.cliente) {
                    sql += ` AND a.codclien = ${data.cliente}`;
                }
                const [r] = await conn.query(sql);
                if(r.length > 0) {
                    obj.nomempre = d.ariagro,
                    obj.datos = r;
                    obj = {
                        nomempre: d.ariagro,
                        datos: r
                    };
                    arr.push(obj);
                    obj = {
                       
                    };
                }
                await conn.end();
              }
              return arr
            
        } catch (error) {
            if (conn) {
                await conn.end()
            }
            throw (error)
        }
    }
}

module.exports = clientes_mysql