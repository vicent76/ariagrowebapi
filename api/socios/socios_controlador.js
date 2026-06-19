const express = require('express')
const router = express.Router()
const socios_mysql = require('./socios_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await socios_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/buscar/:empresa', async (req, res, next) => {
  try {
    const nombre = req.query.nombre || ''

    if (nombre.length < 3) {
      return res.json([])
    }

    const empresa = req.params.empresa

    const result = await socios_mysql.buscar_socios_nombre(nombre, empresa)
    return res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/situacion/todas/:empresa', async (req, res, next) => {
  try {

    const empresa = req.params.empresa

    const result = await socios_mysql.buscar_situaciones(empresa)
    return res.json(result)
  } catch (error) {
    next(error)
  }
})


module.exports = router