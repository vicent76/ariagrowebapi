const express = require('express')
const router = express.Router()
const usuarios_mysql = require('./usuarios_mysql')
const { body, param, validationResult, matchedData } = require('express-validator')

let valBodyLogin = [
    body('usuario').notEmpty().withMessage('Debe incluir el Usuario en el cuerpo del mensaje'),
    body('password').notEmpty().withMessage('Debe incluir el password en el cuerpo del mensaje')
]

let valGetFichajes = [
    param('usuario').notEmpty().withMessage('Falta el Usuario de usuario')
]

let valGetFichajeUnico = [
    param('secuencia').notEmpty().withMessage('Falta el número de secuencia')
]

let valGetFichajesFecha = [
    param('usuario').notEmpty().withMessage('Falta el Usuario de usuario'),
    param('fecha').notEmpty().withMessage('Falta la fecha de los fichajes'),
]
let valPostFichaje = [
    body('idusuario').notEmpty().withMessage('Debe incluir el identificador del usuario en el cuerpo del mensaje'),
    body('Fecha').notEmpty().withMessage('Debe incluir la fecha del fichaje en el cuerpo del mensaje'),
    body('Hora').notEmpty().withMessage('Debe incluir la hora del fichaje en el cuerpo del mensaje'),
    body('HoraReal').notEmpty().withMessage('Debe incluir la hora real del fichaje en el cuerpo del mensaje'),
    body('IdInci').notEmpty().withMessage('Debe incluir el Usuario de incidencia en el cuerpo del mensaje'),
    body('latitud'),
    body('longitud')
]


router.get('/test', async (req, res, next) => {
    try {
        const result = await usuarios_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.post('/login', valBodyLogin, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.login(data)
        if (!result) return res.status(401).json(`Usuario o password incorrectos`)
        return res.json(result)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/fichajes_corto/:usuario', valGetFichajes, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.fichajes_corto(data)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/fichajes_agrupado/:usuario', valGetFichajes, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.fichajes_agrupado(data)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/fichajes_fecha/:usuario/:fecha', valGetFichajesFecha, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.fichajes_fecha(data)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/fichajes_unico/:secuencia', valGetFichajeUnico, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.fichajes_unico(data)
        if (!result) return res.status(404).json('Fichaje no encontrado')
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

router.post('/fichajes', valPostFichaje, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        const data = matchedData(req)
        result = await usuarios_mysql.crear_fichaje(data)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router