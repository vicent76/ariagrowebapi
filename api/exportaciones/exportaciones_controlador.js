const express = require('express')
const router = express.Router()
const exportaciones_mysql = require('./exportaciones_mysql')


router.get('/test', async (req, res, next) => {
    try {
        const result = await exportaciones_mysql.test()
        res.json(result)
    } catch (error) {
        next(error)
    }
})
router.post('/socios/excel', async (req, res) => {
    try {
        const workbook = await exportaciones_mysql.datos_socios(req.body.filtros);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=socios.xlsx'
        );

        await workbook.xlsx.write(res);

        res.end();
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error generando Excel'
        });
    }
});


router.post('/ventas/excel', async (req, res, next) => {
    try {
        const workbook = await exportaciones_mysql.datos_ventas(req.body.filtros)

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=ventas.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error generando Excel'
        });
    }
})

router.post('/campos/excel', async (req, res, next) => {
    try {
        const workbook = await exportaciones_mysql.datos_campos(req.body.filtros)

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=ventas.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error generando Excel'
        });
    }
})

router.post('/recoleccion/excel', async (req, res, next) => {
    try {
        const workbook = await exportaciones_mysql.datos_recoleccion(req.body.filtros)

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=ventas.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()

    } catch (error) {
        res.status(500).json({
            message: error.message || 'Error generando Excel'
        });
    }
})

module.exports = router