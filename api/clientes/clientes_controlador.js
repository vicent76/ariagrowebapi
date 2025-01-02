const express = require('express')
const router = express.Router()
const clientes_mysql = require('./clientes_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await clientes_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        result = await clientes_mysql.todos_clientes()
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router