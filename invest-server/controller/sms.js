let baseComponent = require('../prototype/baseComponent');
const SMSClient = require('@alicloud/sms-sdk');
let users = require('../models/users');
let util = require('../library/util');

const accessKeyId = 'uEJ6SuDJVmtenhQO';
const secretAccessKey = 'ulskmYK9lJCtTsjUsykqNi7P9DWO85';

let smsClient = new SMSClient({accessKeyId, secretAccessKey});

class smsComponent extends baseComponent {
    constructor() {
        super();
    }

    async sendSms(req, res) {
        let datas = Object.keys(req.query).length > 0 ? req.query : req.body;
        let {PhoneNumbers, SignName, TemplateCode, code, product, TemplateParam} = datas;
        try {
            if (!PhoneNumbers) {
                throw new Error('请输入手机号码！')
            }
            if (!TemplateCode) {
                TemplateCode = 'SMS_108165014';
            }
            if (!SignName) {
                SignName = '壹加油'
            }
            if (!code) {
                code = parseInt(Math.random() * (9999 - 1000 + 1) + 1000);
            }
            TemplateParam = TemplateParam ? TemplateParam : {};
            TemplateParam['code'] = code;
            TemplateParam['product'] = product ? product : '';
            TemplateParam = JSON.stringify(TemplateParam);
        } catch (e) {
            console.log(e);
            util.res_error(res, 1001, e.message);
            return
        }
        let params = {
            SignName,
            TemplateCode,
            PhoneNumbers,
            TemplateParam
        };

        users.findOne({phone: PhoneNumbers, userName: {$ne: undefined}}).then(doc => {
            if (doc) {
                util.res_error(res, 9998, '该手机号已注册')
            } else {
                return this.startSend(params)
            }
        }).then(function (response) {
            let {Code} = response;
            if (Code === 'OK') {
                return users.findOne({phone: PhoneNumbers})
            } else {
                return util.res_error(res, 9997, '发送验证码失败')
            }
        }).then((doc) => {
            doc = doc ? doc : new users({phone: PhoneNumbers});
            doc.authCode = code;
            return doc.save();
        }).then(doc => {
            util.res_success(res, 0, '', doc);
        }).catch(err => {
            console.log(err);
            util.res_error(res, 9999, '未知错误')
        })
    }

    async checkAuthCode(req, res) {
        let params = Object.keys(req.query).length > 0 ? req.query : req.body;
        let {phone, authCode} = params;
        try {
            if (!phone) {
                throw new Error('请输入手机号！')
            }
            if (!authCode) {
                throw new Error('请输入验证码！');
            }
        } catch (e) {
            console.log(e);
            util.res_error(res, 1001, e.message);
            return
        }

        users.findOne({phone, authCode}).then(doc => {
            if (doc) {
                util.res_success(res, 0, '', doc)
            } else {
                util.res_error(res, 9997, '验证码错误')
            }
        }).catch(err => {
            console.log(err);
            util.res_error(res, 9998, '验证码错误')
        })
    }

    async checkPhone(req, res) {
        let params = Object.keys(req.query).length > 0 ? req.query : req.body;
        let {phone} = params;
        try {
            if (!phone) {
                throw new Error('请输入手机号！')
            }
        } catch (e) {
            console.log(e);
            util.res_error(res, 1001, e.message);
            return
        }

        users.findOne({phone, userName: {$ne: undefined}}).then(doc => {
            if (doc) {
                util.res_error(res, 9998, '该手机号已注册')
            } else {
                util.res_success(res, 0, '')
            }
        }).catch(err => {
            console.log(err);
            util.res_error(res, 9999, '查询数据库失败')
        })
    }

    async deletePhone(req, res) {
        let params = Object.keys(req.query).length > 0 ? req.query : req.body;
        let {phone} = params;
        try {
            if (!phone) {
                throw new Error('请输入手机号！')
            }
        } catch (e) {
            console.log(e);
            util.res_error(res, 1001, e.message);
            return
        }

        users.updateOne({phone, userName: undefined}, {$set: {authCode: ''}}).then(doc => {
            if (doc.ok === 1) {
                util.res_success(res, 0)
            } else {
                util.res_error(res, 9999, '清楚验证码失败')
            }
        }).catch(err => {
            console.log(err);
            util.res_error(res, 9999, '清楚验证码失败')
        })
    }

    async startSend(params) {
        return smsClient.sendSMS(params)
    }
}

module.exports = new smsComponent();