const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql');
const moment = require('moment');

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
            let fechas = [
                { dFecha: moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD'), hfecha: moment(data.hDate, 'YYYY-MM-DD').format('YYYY-MM-DD') }, { dFecha: moment(data.date, 'YYYY-MM-DD').subtract(1, 'year').format('YYYY-MM-DD'), hfecha: moment(data.hDate, 'YYYY-MM-DD').subtract(1, 'year').format('YYYY-MM-DD') }];


            for (let d of fechas) {
                let cfg = await connector.base();
                conn = await mysql.createConnection(cfg);

                let sql = "SELECT";
                sql += " p.codprodu AS codprodu,";
                sql += " p.nomprodu AS nomprodu,";
                sql += " av.codvarie AS codvarie,";
                sql += " v.nomvarie AS nomvarie,";
                sql += "'" + d.hfecha + "' AS hFecha,";
                sql += " c.nomclien AS nomclien,";
                if (data.variedad) {
                    sql += " true AS filtoVariedad,";
                } else { " false AS filtoVariedad," }
                sql += " SUM(av.totpalet) AS totpalet,";
                sql += " SUM(av.numcajas) AS numcajas,";
                sql += " SUM(av.pesoneto) AS pesoneto,";
                sql += " SUM(fv.impornet) AS importe";
                sql += " FROM albaran AS a";
                sql += " INNER JOIN  albaran_variedad as av ON av.numalbar = a.numalbar";
                sql += " INNER JOIN variedades AS v ON v.codvarie = av.codvarie";
                sql += " INNER JOIN destinos as d ON d.codclien = a.codclien and d.coddesti = a.coddesti";
                sql += " INNER JOIN forfaits as f ON f.codforfait  = av.codforfait";
                sql += " LEFT JOIN productos AS p ON p.codprodu = v.codprodu";
                sql += " LEFT JOIN facturas_variedad AS fv ON fv.numalbar = av.numalbar AND fv.numlinealbar = av.numlinea";
                sql += " LEFT JOIN clientes as c ON c.codclien = a.codclien";
                sql += " WHERE 1 = 1";
                sql += " AND a.fechaalb >= '" + d.dFecha + "' AND a.fechaalb <= '" + d.hfecha + "'";
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
                    obj.nomempre = '';
                    obj.codempre = '';
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