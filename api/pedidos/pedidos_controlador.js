const express = require('express')
const router = express.Router()
const pedidos_mysql = require('./pedidos_mysql')


router.get('/test', async (req, res, next) => {
    try {
        let result = await pedidos_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
});

router.get('/porfecha/:fecha', async (req, res, next) => {
    try {
        let result = await pedidos_mysql.pedidos_por_fecha(req.params.fecha)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});


router.get('/:codvarie', async (req, res, next) => {
    try {
        let result = await pedidos_mysql.productos_variedad(req.params.codvarie)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});

module.exports = router