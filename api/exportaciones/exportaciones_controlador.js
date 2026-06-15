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
router.get('/socios/excel', async (req, res) => {

    const workbook = await exportaciones_mysql.datos_socios();

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
});


module.exports = router