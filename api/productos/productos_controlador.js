const express = require('express')
const router = express.Router()
const productos_mysql = require('./productos_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await productos_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        result = await productos_mysql.todos_productos()
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


module.exports = router