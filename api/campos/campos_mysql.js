const mysql = require('mysql2/promise')
const connector = require('../../lib/conector_mysql')

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
                pu.codpobla,
                pu.codsigpa,
                c.latitud,
                c.longitud,
                c.supsigpa,
                v.nomvarie,
                p.nomparti,
                pu.despobla AS nombrepueblo
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
    }
}


module.exports = campos_mysql