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


router.get('/buscar/:empresa', async (req, res, next) => {
  try {
    const nombre = req.query.nombre || ''
    const empresa = req.params.empresa;
    if (nombre.length < 3) {
      return res.json([])
    }

    const result = await clientes_mysql.buscar_clientes_nombre(nombre, empresa)
    return res.json(result)
  } catch (error) {
    next(error)
  }
})


module.exports = router