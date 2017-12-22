let express = require('express');
let router = express.Router();
let riskComponent = require('../controller/risk');

router.use('/', function (req, res, next) {
    next();
});

router.use('/enter', async function (req, res) {
    await riskComponent.entry(req, res)
});

module.exports = router;
