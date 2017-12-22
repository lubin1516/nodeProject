let express = require('express');
let router = express.Router();
let smsComponent = require('../controller/sms');


router.use('/send', async function (req, res) {
    await smsComponent.sendSms(req, res)
});

router.use('/checkAuthCode', async function (req, res) {
    await smsComponent.checkAuthCode(req, res);
});

router.use('/checkPhone', async function (req, res) {
    await smsComponent.checkPhone(req, res);
});

router.use('/deletePhone', async function (req, res) {
    await smsComponent.deletePhone(req, res)
});

module.exports = router;
