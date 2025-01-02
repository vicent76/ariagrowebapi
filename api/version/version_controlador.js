const express = require('express');
var router = express.Router();

const pack = require('../../package.json')

router.get('/',(req,res) => {
    let version =     {
        name: pack.name,
        version: pack.version,
        description: pack.description
    };
    res.json(version);
});

module.exports = router;