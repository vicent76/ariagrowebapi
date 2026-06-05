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

router.get('/socio/:codsocio', async (req, res, next) => {
    try {
        let result = await campos_mysql.campos_socio(req.params.codsocio)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});

router.get('/socio/clasificacion/:codcampo', async (req, res, next) => {
    try {
        let result = await campos_mysql.campo_clasificacion(req.params.codcampo)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});



router.get('/coordenadas/:pr/:mu/:ag/:zo/:po/:pa/:re', async (req, res, next) => {
    try {
        let pr = req.params.pr;
        let mu = req.params.mu;
        let ag = req.params.ag;
        let zo = req.params.zo;
        let po = req.params.po;
        let pa = req.params.pa;
        let re = req.params.re;
        let result = await campos_mysql.get_coordenadas(pr, mu, ag, zo, po, pa, re)
        return res.json(result)
    } catch (error) {
        next(error)
    }
});


module.exports = router