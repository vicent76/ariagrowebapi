const express = require('express')
const router = express.Router()
const variedades_mysql = require('./variedades_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await variedades_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
});

router.get('/', async (req, res, next) => {
    try {
        result = await variedades_mysql.todas_variedades()
        return res.json(result)
    } catch (error) {
        next(error)
    }
});

router.get('/:codprodu', async (req, res, next) => {
    try {
        result = await variedades_mysql.variedades_producto(req.params.codprodu)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})



module.exports = router