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
    }

}

module.exports = exportaciones_mysql