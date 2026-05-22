const express = require('express')
const router = express.Router()
const campos_mysql = require('./campos_mysql')


router.get('/test', async (req, res, next) => {
    try {
        let result = await campos_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
});

router.get('/socio/:/:codsocio', async (req, res, next) => {
    try {
        let result = await campos_mysql.campos_socio(req.params.codsocio)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});


router.get('/observaciones/:numpedid/:numlinea', async (req, res, next) => {
    try {
        let result = await campos_mysql.pedidos_observa(req.params.numpedid, req.params.numlinea)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});

router.put('/:numpedid/:numlinea', async (req, res, next) => {
    try {
        let result = await campos_mysql.put_pedidos_variedad(req.params.numpedid, req.params.numlinea, req.body.data)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});

router.put('/observaciones/:numpedid/:numlinea/:mensAriagroPedidos', async (req, res, next) => {
    try {
        let result = await campos_mysql.put_pedidos_observa_usu(req.params.numpedid, req.params.numlinea, req.params.mensAriagroPedidos)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});



module.exports = router