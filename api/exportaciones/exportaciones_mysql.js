const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql');
const moment = require('moment');
const ExcelJS = require('exceljs')
const path = require('path')

const exportaciones_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_socios: async (data) => {
        let conn

        try {
            const cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sql = `
            SELECT 
                r.codsocio CODIGO,
                r.nroasociado ASOCIADO,
                r.nomsocio NOMBRE,
                r.dirsocio DIRECCION,
                r.codpostal CPOSTAL,
                r.pobsocio POBLACION,
                r.prosocio PROVINCIA,
                p.nompaise PAIS,
                r.nifsocio NIF,
                r.telsoci1 TELF1,
                r.telsoci2 TELF2,
                r.telsoci3 TELF3,
                r.movsocio MOVIL,
                r.maisocio MAIL, 
                r.fechaalta FALTA, 
                r.fechabaja FBAJA,
                r.fechanac FNACIMIENTO,
                r.iban IBAN, 
                r.observaciones OBSERVACIONES,

                IF(r.tipoirpf = 0, 'MODULOS',
                    IF(r.tipoirpf = 1, 'E.D.',
                        IF(r.tipoirpf = 2, 'ENTIDAD', 'DESCONOCIDO')
                    )
                ) IRPF,

                IF(r.tipoprod = 0, 'SOCIO',
                    IF(r.tipoprod = 1, 'TERCERO',
                        IF(r.tipoprod = 2, 'OTRA OPA',
                            IF(r.tipoprod = 3, 'APORTACIONISTA',
                                IF(r.tipoprod = 4, 'NO PRODUCTOR', 'DESCONOCIDO')
                            )
                        )
                    )
                ) TIPOSOCIO,

                IF(r.tiporelacion = 0, 'SOCIO',
                    IF(r.tiporelacion = 1, 'ASOCIADO',
                        IF(r.tiporelacion = 2, 'TERCERO',
                            IF(r.tiporelacion = 3, 'SOCIO TEMPORAL', 'DESCONOCIDO')
                        )
                    )
                ) TIPORELACION,

                s.nomsitua SITUACION,
                r.votos VOTOS,
                r.capital CAPITAL,

                IF(r.hayembargo = 0, 'NO',
                    IF(r.hayembargo = 1, 'SI', 'DESCONOCIDO')
                ) EMBARGO,

                r.nrorea REA,
                r.nrosiex SIEX

            FROM rsocios r
            INNER JOIN rsituacion s ON r.codsitua = s.codsitua
            INNER JOIN paises p ON r.codpaise = p.codpaise
            LIMIT 10
        `

            const [result] = await conn.query(sql)

            const workbook = new ExcelJS.Workbook()
            const sheet = workbook.addWorksheet('Socios')

            if (result.length > 0) {
                sheet.columns = Object.keys(result[0]).map(nombreColumna => ({
                    header: nombreColumna,
                    key: nombreColumna,
                    width: 20
                }))

                sheet.addRows(result)
            }


            return workbook

        } catch (error) {
            throw error
        } finally {
            if (conn) {
                await conn.end()
            }
        }
    },

    datos_ventas: async (filtros) => {
        let conn

        try {
            const cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sql = sqlventas(filtros)

            const [result] = await conn.query(sql)

            const workbook = new ExcelJS.Workbook()
            const sheet = workbook.addWorksheet('Ventas-comercial')

            if (result.length > 0) {
                sheet.columns = Object.keys(result[0]).map(nombreColumna => ({
                    header: nombreColumna,
                    key: nombreColumna,
                    width: 20
                }))

                sheet.addRows(result)
            }

            return workbook

        } catch (error) {
            throw error
        } finally {
            if (conn) {
                await conn.end()
            }
        }
    }

}

function sqlventas(filtros) {
    let sql = `
            SELECT 
            albaran.fechaalb FECHA, 
            albaran.numalbar ALBARAN,
            albaran_variedad.numlinea LIN,
            clientes.codclien CLIENTE,
            nomclien 'NOMBRE CLIENTE',
            albaran.coddesti DESTINO,
            nomdesti 'NOMBRE DESTINO',
            albaran_variedad.codvarie VARIEDAD,
            nomvarie 'NOMBRE VARIEDAD',
            albaran_variedad.codforfait CONFECCION,
            nomconfe 'NOMBRE CONFECCION',
            albaran_variedad.codmarca MARCA,
            nommarca 'NOMBRE MARCA',
            COALESCE(albaran_variedad.totpalet,0) PALETS,
            albaran_variedad.numcajas CAJAS,
            COALESCE(albaran_variedad.unidades,0) UNIDADES, 
            forfaits.kiloscaj 'KGS/CAJA' , 
            albaran_variedad.pesobrut 'P.BRUTO',
            albaran_variedad.pesoneto 'P.NETO', 
            albaran_variedad.preciopro 'PRECIO PRO.',
            COALESCE(albaran_variedad.preciodef,0)  'PRECIO DEF.',
            SUM(facturas_variedad.impornet) 'IMP.FACTURADO', 
            IF(facturas_variedad.numalbar IS NULL, 'NO','SI') FACTURADO,
            t.gastos 'GASTOS CONF',
            t.envases 'GASTOS MAT.',
            t.portes 'GASTOS PORTES',
            t.totalgastos 'TOTAL GASTOS',
            ROUND( IF(numcajas=0,0,   totalgastos /  numcajas),4)  'GASTOxCAJA',
            ROUND( IF(pesoneto=0,0,   totalgastos /  pesoneto),4)  'GASTOxKILO',
            ROUND( IF(numcajas=0,0,   SUM(facturas_variedad.impornet) /  numcajas),4)  'FACT. x CAJA',
            ROUND( IF(pesoneto=0,0,   SUM(facturas_variedad.impornet) /  pesoneto),4)  'FACT. x KILO',
            SUM(facturas_variedad.impornet) - t.totalgastos  'VALOR FRUTA',
            ROUND( IF(numcajas=0,0,   (SUM(facturas_variedad.impornet) - t.totalgastos)   /  numcajas),4)  'NETO-CAJA',
            ROUND( IF(pesoneto=0,0,   (SUM(facturas_variedad.impornet) - t.totalgastos)   /  pesoneto),4)  'NETO-KILO'
            FROM
            albaran 
            INNER JOIN albaran_variedad ON albaran.numalbar = albaran_variedad.numalbar
            INNER JOIN variedades ON albaran_variedad.codvarie = variedades.codvarie
            INNER JOIN clientes ON albaran.codclien = clientes.codclien
            INNER JOIN destinos ON albaran.codclien = destinos.codclien AND albaran.coddesti = destinos.coddesti
            INNER JOIN forfaits ON albaran_variedad.codforfait = forfaits.codforfait
            INNER JOIN marcas ON albaran_variedad.codmarca=marcas.codmarca

            INNER JOIN (SELECT numalbar,numlinea,
            ROUND(SUM(IF(tipogasto=0,albaran_costes.impcoste,0)),2) gastos,
            ROUND(SUM(IF(tipogasto=1,albaran_costes.impcoste,0)),2) envases,
            ROUND(SUM(IF(tipogasto=2,albaran_costes.impcoste,0)),2) portes,
            ROUND(SUM(albaran_costes.impcoste),2) totalgastos
            FROM albaran_costes GROUP BY  numalbar,numlinea ) AS t ON t.numalbar=albaran.numalbar AND t.numlinea=albaran_variedad.numlinea

            LEFT JOIN facturas_variedad ON albaran_variedad.numalbar = facturas_variedad.numalbar AND albaran_variedad.numlinea = facturas_variedad.numlinealbar
            WHERE 
            albaran.fechaalb >= '${filtros.desde}' AND albaran.fechaalb <= '${filtros.hasta}'
            AND clientes.codclien >= ${filtros.dCliente}  AND clientes.codclien <= ${filtros.hCliente}
            AND forfaits.codforfait >=  '${filtros.dForfait}' AND forfaits.codforfait <= '${filtros.hForfait}'
            AND albaran_variedad.codvarie IN (${filtros.variedades})
            GROUP BY albaran.fechaalb, albaran.numalbar,albaran_variedad.numlinea
    `;

    return sql;
}



module.exports = exportaciones_mysql