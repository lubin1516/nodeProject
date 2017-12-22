let express = require('express');
let router = express.Router();
let userComponent = require('../controller/user');
/* GET users listing. */
router.use('/', function (req, res, next) {
    next();
});

router.use('/create', async function (req, res) {
    await userComponent.create(req, res);
});

module.exports = router;
