const express = require('express')
const router = express.Router()
const forfaits_mysql = require('./forfaits_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await forfaits_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        result = await forfaits_mysql.todos_forfaits()
        return res.json(result)
    } catch (error) {
        next(error)
    }
})


router.get('/buscar', async (req, res, next) => {
  try {
    const nombre = req.query.nombre || ''

    if (nombre.length < 3) {
      return res.json([])
    }

    const result = await forfaits_mysql.buscar_forfaits_nombre(nombre)
    return res.json(result)
  } catch (error) {
    next(error)
  }
})


module.exports = router