const express = require('express')
const router = express.Router()
const comparativa_mysql = require('./comparativa_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await comparativa_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        result = await comparativa_mysql.datos_comparativa(req.body)
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router