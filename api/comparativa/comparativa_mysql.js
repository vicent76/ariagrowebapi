const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

const clientes_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_comparativa: async (data) => {
        let conn = undefined;
        let obj = {
            nomempre: null,
            codempre: null
        };
        let arr = [];
        let codvariesPrimera = []; // Para almacenar los codvarie de la primera ejecución
        let [r] = []
    
        try {
            for (let d of data.empresas) {
                console.log(`empresa: ${d.ariagro}`);
                let cfg = await connector.empresa(d.ariagro);
                conn = await mysql.createConnection(cfg);
                
                let sql = "SELECT";
                sql += " p.codprodu AS codprodu,";
                sql += " p.nomprodu AS nomprodu,";
                sql += " av.codvarie AS codvarie,";
                sql += " v.nomvarie AS nomvarie,";
                sql += " SUM(av.totpalet) AS totpalet,";
                sql += " SUM(av.numcajas) AS numcajas,";
                sql += " SUM(av.pesoneto) AS pesoneto";
                sql += " FROM albaran_variedad av";
                sql += " LEFT JOIN albaran as a ON a.numalbar = av.numalbar";
                sql += " LEFT JOIN variedades AS v ON v.codvarie = av.codvarie";
                sql += " LEFT JOIN productos AS p ON p.codprodu = v.codprodu";
                sql += " WHERE 1 = 1";
    
                // Filtros según los parámetros
                if (data.variedad) {
                    sql += ` AND av.codvarie = ${data.variedad}`;
                }
                if (data.producto) {
                    sql += ` AND v.codprodu = ${data.producto}`;
                }
                if (data.cliente) {
                    sql += ` AND a.codclien = ${data.cliente}`;
                }
                if (codvariesPrimera.length === 0) {
                    sql += " GROUP BY av.codvarie";
                    sql += " ORDER BY av.codvarie";
                    [r] = await conn.query(sql);
                }
              
    
               
    
                if (r.length > 0) {
                    if (codvariesPrimera.length === 0) {
                        // Si es la primera empresa, guardamos los codvarie
                        codvariesPrimera = r.map(row => row.codvarie);
                    } else {
                        // En las siguientes consultas, filtramos por los codvarie de la primera consulta
                        sql += ` AND av.codvarie IN (${codvariesPrimera.join(',')})`;
                        sql += " GROUP BY av.codvarie";
                        sql += " ORDER BY av.codvarie";
                        let [rFiltrada] = await conn.query(sql);
                        if (rFiltrada.length > 0) {
                            r = rFiltrada;
                        }
                    }
                    
                    // Guardamos los resultados para la empresa actual
                    obj.nomempre = d.nomempre;
                    obj.codempre = d.codempre;
                    obj.datos = r;
                    arr.push(obj);
                    
                    // Reiniciamos el objeto
                    obj = {};
                }
    
                await conn.end();
            }
            
            return arr;
    
        } catch (error) {
            if (conn) {
                await conn.end();
            }
            throw error;
        }
    }
    
}

module.exports = clientes_mysql