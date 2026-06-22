const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')
const fetch = require('node-fetch')

const campos_mysql = {
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
                c.codcampo,
                c.nrocampo,
                c.codsocio,
                c.poligono, 
                c.parcela, 
                c.recintos,
                c.supsigpa,
                c.latitud,
                c.longitud,
                c.supsigpa,
                c.nroarbol,
                c.anoplant,
                c.refexterna AS refexternacampo,
                v.nomvarie,
                p.nomparti,
                pu.despobla AS nombrepueblo,
                pu.codpobla,
                pu.codsigpa
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
                    result[i].refexternacampo = 'AAAAAA' + i;

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

    campo_clasificacion: async (codcampo) => {
        let conn = undefined

        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sqlResumen = `
            SELECT
                IFNULL(h.kilos_clasificados, 0) AS kilos_clasificados,
                IFNULL(c.kilos_rclasifica, 0) AS kilos_rclasifica,
                IFNULL(e.kilos_rentradas, 0) AS kilos_rentradas,

                IFNULL(h.kilos_clasificados, 0)
                + IFNULL(c.kilos_rclasifica, 0)
                + IFNULL(e.kilos_rentradas, 0) AS kilos_totales_recolectados,

                IFNULL(c.kilos_rclasifica, 0)
                + IFNULL(e.kilos_rentradas, 0) AS kilos_pendientes_clasificar,

                fechas.primera_fecha_recoleccion,
                fechas.ultima_fecha_recoleccion

            FROM
            (
                    SELECT
                        SUM(kilosnet) AS kilos_clasificados
                    FROM rhisfruta
                    WHERE codcampo = ?
                ) h

                CROSS JOIN

                (
                    SELECT
                        SUM(kilosnet) AS kilos_rclasifica
                    FROM rclasifica
                    WHERE codcampo = ?
                ) c

                CROSS JOIN

                (
                    SELECT
                        SUM(kilosnet) AS kilos_rentradas
                    FROM rentradas
                    WHERE codcampo = ?
                ) e

                CROSS JOIN

                (
                    SELECT
                        MIN(fecha) AS primera_fecha_recoleccion,
                        MAX(fecha) AS ultima_fecha_recoleccion
                    FROM
                    (
                        SELECT fecalbar AS fecha
                        FROM rhisfruta
                        WHERE codcampo = ?

                        UNION ALL

                        SELECT fechaent
                        FROM rclasifica
                        WHERE codcampo = ?

                        UNION ALL

                        SELECT fechaent
                        FROM rentradas
                        WHERE codcampo = ?
                    ) f
                ) fechas
                        `

            const sqlClasificacion = `
            SELECT  
                rhisfruta_clasif.codcalid, 
                rcalidad.nomcalid AS calidad, 
                SUM(rhisfruta_clasif.kilosnet) AS kilos
            FROM rhisfruta_clasif
            INNER JOIN rcalidad 
                ON rhisfruta_clasif.codvarie = rcalidad.codvarie 
                AND rhisfruta_clasif.codcalid = rcalidad.codcalid
            INNER JOIN rhisfruta 
                ON rhisfruta.numalbar = rhisfruta_clasif.numalbar
            WHERE rhisfruta.codcampo = ?
            GROUP BY 1,2
            ORDER BY 1,2
        `

            const [resumenResult] = await conn.query(sqlResumen, [
                codcampo, // rhisfruta kilos
                codcampo, // rclasifica kilos
                codcampo, // rentradas kilos
                codcampo, // rhisfruta fechas
                codcampo, // rclasifica fechas
                codcampo  // rentradas fechas
            ])

            const [clasificacion] = await conn.query(sqlClasificacion, [
                codcampo
            ])

            await conn.end()

            return {
                resumen: resumenResult[0] || {
                    kilos_clasificados: 0,
                    kilos_rclasifica: 0,
                    kilos_rentradas: 0,
                    kilos_totales_recolectados: 0,
                    kilos_pendientes_clasificar: 0,
                    primera_fecha_recoleccion: null,
                    ultima_fecha_recoleccion: null
                },
                clasificacion
            }

        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    },

    campo_revision: async (codcampo) => {
        let conn = undefined

        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            const sql = `
            SELECT * from rcampos_revision WHERE codcampo = ? ORDER BY fecha DESC, numlinea DESC
            `
            const [result] = await conn.query(sql, [
                codcampo, // rhisfruta kilos
            ])

            await conn.end()

            return result

        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    },

    get_coordenadas: async (pr, mu, ag, zo, po, pa, re) => {
        try {
            const url = `https://sigpac-hubcloud.es/servicioconsultassigpac/query/recincentroid/${pr}/${mu}/${ag}/${zo}/${po}/${pa}/${re}.json`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`)
            }

            const data = await response.json()

            console.log(data)
            return data
        } catch (error) {
            console.error('Error consultando SIGPAC:', error.message)
        }
    },

    crear_revision: async (revision) => {
        let conn = undefined

        try {
            let cfg = await connector.base()
            conn = await mysql.createConnection(cfg)

            await conn.beginTransaction()

            const tecnicoId = revision.tecnicoId
            delete revision.tecnicoId

            const sql = `
            INSERT INTO rcampos_revision SET ?
        `

            const [result] = await conn.query(sql, [
                revision
            ])

            const sqlU = `
            SELECT COALESCE(MAX(idmensaje), 0) + 1 AS max_id 
            FROM ${process.env.ARAW_MYSQL_DATABASE_USUARIOS}.info_mensajes
            FOR UPDATE
        `

            const [result2] = await conn.query(sqlU)

            const data = {
                idmensaje: result2[0].max_id,
                fecha: revision.fecha,
                codusu: tecnicoId,
                aplicacion: process.env.ARAW_MYSQL_DATABASE,
                mensaje: revision.observac,
                codusudes: null
            }

            const sqlU2 = `
            INSERT INTO ${process.env.ARAW_MYSQL_DATABASE_USUARIOS}.info_mensajes SET ?
        `

            const [result3] = await conn.query(sqlU2, [
                data
            ])

            await conn.commit()

            return result

        } catch (error) {
            if (conn) {
                await conn.rollback()
            }

            throw error

        } finally {
            if (conn) {
                await conn.end()
            }
        }
    },

    partidas_buscar: async (nombre, empresa) => {
        let conn = undefined

        try {
            let cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
            SELECT * from rpartida WHERE nomparti  LIKE ? ORDER BY nomparti ASC
            `
            const [result] = await conn.query(sql, [`%${nombre}%`])

            await conn.end()

            return result

        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    },

    buscar_situaciones_campos: async (empresa) => {
        let conn = undefined

        try {
            const cfg = await connector.empresa(empresa)
            conn = await mysql.createConnection(cfg)

            const sql = `
                SELECT
                   * from rsituacioncampo
            `

            const [result] = await conn.query(sql)

            await conn.end()
            return result
        } catch (error) {
            if (conn) await conn.end()
            throw error
        }
    }
}




module.exports = campos_mysql