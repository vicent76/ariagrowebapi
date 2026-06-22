const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql');
const moment = require('moment');
const ExcelJS = require('exceljs')
const path = require('path')

const exportaciones_mysql = {
    test: async () => {
        return 'COMPARATIVA TEST'
    },
    datos_socios: async (filtros) => {
        let conn

        try {
            const cfg = await connector.empresa(filtros.empresa)
            conn = await mysql.createConnection(cfg)

            const sql = sqlSocios(filtros)


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
            const cfg = await connector.empresa(filtros.empresa)
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
    },


    datos_campos: async (filtros) => {
        let conn

        try {
            const cfg = await connector.empresa(filtros.empresa)
            conn = await mysql.createConnection(cfg)

            const sql = sqlCampos(filtros)

            const [result] = await conn.query(sql)

            const workbook = new ExcelJS.Workbook()
            const sheet = workbook.addWorksheet('Campos')

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

    datos_recoleccion: async (filtros) => {
        let conn

        try {
            const cfg = await connector.empresa(filtros.empresa)
            conn = await mysql.createConnection(cfg)

            const sql = sqlRecoleccion(filtros)

            const [result] = await conn.query(sql)

            const workbook = new ExcelJS.Workbook()
            const sheet = workbook.addWorksheet('Recoleccion')

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

function sqlSocios(filtros) {
    let sql = `
        SELECT 
            codsocio CODIGO,
            nroasociado ASOCIADO,
            nomsocio NOMBRE,
            dirsocio DIRECCIÓN,
            codpostal CPOSTAL,
            pobsocio POBLACION,
            prosocio PROVINCIA,
            nompaise,
            nifsocio NIF,
            telsoci1 TELF1,
            telsoci2 TELF2,
            telsoci3 TELF3,
            movsocio MOVIL,
            maisocio MAIL, 
            fechaalta FALTA, 
            fechabaja FBAJA,
            fechanac FNACIMIENTO,
            iban IBAN, 
            observaciones OBSERVACIONES,
            IF(tipoirpf=0,'MODULOS',IF(tipoirpf=1,'E.D.',IF(tipoirpf=2,'ENTIDAD','DESCONOCIDO'))) IRPF,
            IF(tipoprod=0,'SOCIO',IF(tipoprod=1,'TERCERO',IF(tipoprod=2,'OTRA OPA',IF(tipoprod=3,'APORTACIONISTA',IF(tipoprod=4,'NO PRODUCTOR','DESCONOCIDO'))))) TIPOSOCIO,
            IF(tiporelacion=0,'SOCIO',IF(tiporelacion=1,'ASOCIADO',IF(tiporelacion=2,'TERCERO',IF(tiporelacion=3,'SOCIO TEMPORAL','DESCONOCIDO')))) TIPORELACION,
            nomsitua,
            votos,
            capital,
            IF(hayembargo=0,'NO',IF(hayembargo=1,'SI','DESCONOCIDO')) EMBARGO,
            nrorea,
            nrosiex
        FROM rsocios, rsituacion, paises
        WHERE 
            rsocios.codsitua = rsituacion.codsitua
            AND rsocios.codpaise = paises.codpaise
    `;

    if (filtros.dSocio) {
        sql += ` AND rsocios.codsocio >= ${filtros.dSocio}`;
    }

    if (filtros.hSocio) {
        sql += ` AND rsocios.codsocio <= ${filtros.hSocio}`;
    }
    if (Array.isArray(filtros.situaciones) && filtros.situaciones.length > 0) {
        sql += ` AND rsituacion.codsitua IN (${filtros.situaciones.join(',')})`;
    }

    if (!filtros.verSociosBaja) {
        sql += ` AND fechabaja IS NULL`;
    }


    sql += `
        ORDER BY rsocios.codsocio
    `;

    return sql;
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
            forfaits.kiloscaj 'KGS/CAJA', 
            albaran_variedad.pesobrut 'P.BRUTO',
            albaran_variedad.pesoneto 'P.NETO', 
            albaran_variedad.preciopro 'PRECIO PRO.',
            COALESCE(albaran_variedad.preciodef,0) 'PRECIO DEF.',
            SUM(facturas_variedad.impornet) 'IMP.FACTURADO', 
            IF(facturas_variedad.numalbar IS NULL, 'NO','SI') FACTURADO,
            t.gastos 'GASTOS CONF',
            t.envases 'GASTOS MAT.',
            t.portes 'GASTOS PORTES',
            t.totalgastos 'TOTAL GASTOS',
            ROUND(IF(numcajas = 0, 0, totalgastos / numcajas), 4) 'GASTOxCAJA',
            ROUND(IF(pesoneto = 0, 0, totalgastos / pesoneto), 4) 'GASTOxKILO',
            ROUND(IF(numcajas = 0, 0, SUM(facturas_variedad.impornet) / numcajas), 4) 'FACT. x CAJA',
            ROUND(IF(pesoneto = 0, 0, SUM(facturas_variedad.impornet) / pesoneto), 4) 'FACT. x KILO',
            SUM(facturas_variedad.impornet) - t.totalgastos 'VALOR FRUTA',
            ROUND(IF(numcajas = 0, 0, (SUM(facturas_variedad.impornet) - t.totalgastos) / numcajas), 4) 'NETO-CAJA',
            ROUND(IF(pesoneto = 0, 0, (SUM(facturas_variedad.impornet) - t.totalgastos) / pesoneto), 4) 'NETO-KILO'
        FROM albaran 
            INNER JOIN albaran_variedad 
                ON albaran.numalbar = albaran_variedad.numalbar
            INNER JOIN variedades 
                ON albaran_variedad.codvarie = variedades.codvarie
            INNER JOIN clientes 
                ON albaran.codclien = clientes.codclien
            INNER JOIN destinos 
                ON albaran.codclien = destinos.codclien 
                AND albaran.coddesti = destinos.coddesti
            INNER JOIN forfaits 
                ON albaran_variedad.codforfait = forfaits.codforfait
            INNER JOIN marcas 
                ON albaran_variedad.codmarca = marcas.codmarca
            INNER JOIN (
                SELECT 
                    numalbar,
                    numlinea,
                    ROUND(SUM(IF(tipogasto = 0, albaran_costes.impcoste, 0)), 2) gastos,
                    ROUND(SUM(IF(tipogasto = 1, albaran_costes.impcoste, 0)), 2) envases,
                    ROUND(SUM(IF(tipogasto = 2, albaran_costes.impcoste, 0)), 2) portes,
                    ROUND(SUM(albaran_costes.impcoste), 2) totalgastos
                FROM albaran_costes 
                GROUP BY numalbar, numlinea
            ) AS t 
                ON t.numalbar = albaran.numalbar 
                AND t.numlinea = albaran_variedad.numlinea
            LEFT JOIN facturas_variedad 
                ON albaran_variedad.numalbar = facturas_variedad.numalbar 
                AND albaran_variedad.numlinea = facturas_variedad.numlinealbar
        WHERE 1 = 1
    `;

    if (filtros.desde) {
        sql += ` AND albaran.fechaalb >= '${filtros.desde}'`;
    }

    if (filtros.hasta) {
        sql += ` AND albaran.fechaalb <= '${filtros.hasta}'`;
    }

    if (filtros.dCliente) {
        sql += ` AND clientes.codclien >= ${filtros.dCliente}`;
    }

    if (filtros.hCliente) {
        sql += ` AND clientes.codclien <= ${filtros.hCliente}`;
    }

    if (filtros.dForfait) {
        sql += ` AND forfaits.codforfait >= '${filtros.dForfait}'`;
    }

    if (filtros.hForfait) {
        sql += ` AND forfaits.codforfait <= '${filtros.hForfait}'`;
    }

    if (Array.isArray(filtros.variedades) && filtros.variedades.length > 0) {
        sql += ` AND albaran_variedad.codvarie IN (${filtros.variedades.join(',')})`;
    }


    sql += `
        GROUP BY 
            albaran.fechaalb, 
            albaran.numalbar,
            albaran_variedad.numlinea
    `;

    return sql;
}

function sqlCampos(filtros) {
    let sql = `
        SELECT 
            codcampo CODIGO, 
            nrocampo NUMERO,
            refexterna REFEXTERNA,
            rcampos.codsocio SOCIO, 
            nomsocio NOMSOCIO, 
            fecaltas FALTA,
            fecbajas FBAJA,
            rcampos.codvarie VARIEDAD,
            nomvarie NOMVARIEDAD, 
            rcampos.codparti PARTIDA,
            nomparti NOMPARTIDA, 
            despobla MUNICIPIO,
            rcampos.codzonas ZONA, 
            rzonas.nomzonas NOMZONA,
            poligono POL, 
            parcela PARC, 
            recintos REC,
            refercatas CATASTRO,
            supsigpa HDASIGPAC,
            supcoope HDACOOP,
            anoplant AÑO, 
            nroarbol ARBOLES,
            canaforo AFORO,
            nomsitua SITUACION, 
            observac OBSERVACION, 
            rcampos.codcapat CAPATAZ, 
            rcapataz.nomcapat NOMCAPATAZ,
            nrollave LLAVE
        FROM rcampos, rsocios, variedades, rpartida, rpueblos, rsituacioncampo, rcapataz, rzonas
        WHERE 
            rcampos.codsocio = rsocios.codsocio
            AND rcampos.codvarie = variedades.codvarie
            AND rcampos.codparti = rpartida.codparti
            AND rpartida.codpobla = rpueblos.codpobla
            AND rcampos.codsitua = rsituacioncampo.codsitua
            AND rcampos.codcapat = rcapataz.codcapat
            AND rcampos.codzonas = rzonas.codzonas
    `;

    if (filtros.dSocio) {
        sql += ` AND rsocios.codsocio >= ${filtros.dSocio}`;
    }

    if (filtros.hSocio) {
        sql += ` AND rsocios.codsocio <= ${filtros.hSocio}`;
    }

    if (filtros.dPartida) {
        sql += ` AND rpartida.codparti >= ${filtros.dPartida}`;
    }

    if (filtros.hPartida) {
        sql += ` AND rpartida.codparti <= ${filtros.hPartida}`;
    }

    if (Array.isArray(filtros.variedades) && filtros.variedades.length > 0) {
        sql += ` AND variedades.codvarie IN (${filtros.variedades.join(',')})`;
    }

    if (Array.isArray(filtros.situaciones) && filtros.situaciones.length > 0) {
        sql += ` AND rsituacioncampo.codsitua IN (${filtros.situaciones.join(',')})`;
    }

    if (!filtros.verCamposBaja) {
        sql += ` AND fecbajas IS NULL`;
    }

    sql += `
        ORDER BY rcampos.codsocio, rcampos.codcampo
    `;

    return sql;
}

function sqlRecoleccion(filtros) {
    let sql = `
        SELECT 
            numalbar ALBARAN,
            fecalbar FECHA,
            h.codsocio SOCIO,
            nomsocio NOMSOCIO,
            h.codvarie VARIEDAD,
            nomvarie NOMVARIEDAD,
            h.codcampo CODCAMPO,
            c.nrocampo NROCAMPO,
            c.codparti PARTIDA,
            nomparti NOMPARTIDA,
            despobla MUNICIPIO,
            c.codzonas ZONA,
            rzonas.nomzonas NOMZONA,
            IF(tipoentr=0,'NORMAL',IF(tipoentr=1,'V.CAMPO',IF(tipoentr=2,'P.INTEGRADO',IF(tipoentr=3,'IND.DIRECTO',IF(tipoentr=4,'RETIRADA',IF(tipoentr=5,'VENTA COMERCIO','DESCONOCIDO')))))) TIPOENTRADA,
            IF(h.recolect=0,'COOP.',IF(h.recolect=1,'SOCIO',IF(h.recolect=2,'OTROS','DESCONOCIDO'))) RECOLECTADO,
            IF(h.transportadopor=0,'COOP.',IF(h.transportadopor=1,'SOCIO',IF(h.transportadopor=2,'OTROS','DESCONOCIDO'))) TRANSPORTADO,
            kilosbru KBRUTOS,
            numcajon CAJONES,
            kilosnet KNETOS,
            imptrans TRANSPORTE,
            impacarr ACARREO,
            imprecol RECOL,
            imppenal PENAL
        FROM rhisfruta h, variedades, rsocios, rcampos c, rpartida, rpueblos, rzonas
        WHERE 
            h.codvarie = variedades.codvarie
            AND h.codsocio = rsocios.codsocio
            AND h.codcampo = c.codcampo
            AND c.codparti = rpartida.codparti
            AND rpartida.codpobla = rpueblos.codpobla
            AND c.codzonas = rzonas.codzonas
    `;

    if (filtros.desde) {
        sql += ` AND h.fecalbar >= '${filtros.desde}'`;
    }

    if (filtros.hasta) {
        sql += ` AND h.fecalbar <= '${filtros.hasta}'`;
    }

    if (filtros.dSocio) {
        sql += ` AND h.codsocio >= ${filtros.dSocio}`;
    }

    if (filtros.hSocio) {
        sql += ` AND h.codsocio <= ${filtros.hSocio}`;
    }

    if (Array.isArray(filtros.variedades) && filtros.variedades.length > 0) {
        sql += ` AND h.codvarie IN (${filtros.variedades.join(',')})`;
    }

    sql += `
        ORDER BY h.fecalbar, h.numalbar
    `;

    return sql;
}

module.exports = exportaciones_mysql