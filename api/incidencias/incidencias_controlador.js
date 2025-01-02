const express = require('express')
const router = express.Router()
const incidencias_mysql = require('./incidencias_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await incidencias_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        result = await incidencias_mysql.todas_incidencias()
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router