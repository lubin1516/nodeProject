let baseComponent = require('../prototype/baseComponent');
let util = require('../library/util');
let Rsa = require('node-rsa');
let fs = require('fs');

let private_key = new Rsa(fs.readFileSync(__dirname + '/rsa_private_key.pem').toString(), {signingScheme: 'sha1'});
let public_key = new Rsa(fs.readFileSync(__dirname + '/rsa_public_key.pem').toString(), {signingScheme: 'sha1'});


class riskComponent extends baseComponent {
    constructor() {
        super();
        this.app_id = '2010184';
        this.version = '1.0';
        this.sign_type = 'RSA';
        this.format = 'JSON';
    }

    async entry(req, res) {
        try {
            let index, params;
            let method = (req.query.method ? req.query.method : req.body.method).split('.');
            index = ['phone', 'name', 'idNumber', 'method'];
            if (method.indexOf('baidu') >= 0) {
                params = await this.check(req, res, index);
            } else if (method.indexOf('collectuser') >= 0) {
                params = await this.check(req, res, index);
                params['type'] = 'mobile';
                params['platform'] = 'web';
                params['notifyUrl'] = '';
                params['userId'] = '111';
                params['version'] = '2.0';
                params['outUniqueId'] = '2017010101010101';
            } else if (method.indexOf('detail') >= 0) {
                params = await this.check(req, res, index);
                params['userId'] = '111';
                params['outUniqueId'] = '2017010101010101';
            }
            await this.search(res, params.method, JSON.stringify(params));
        } catch (e) {
            console.log(e.message);
            util.res_error(res, 9999, '查询失败');
        }
    }

    async check(req, res, index) {
        let params = {};
        let container = Object.keys(req.query).length > 0 ? req.query : req.body;
        Object.keys(container).filter(function (key) {
            return container[key] !== undefined && container[key] !== '' && index.indexOf(key) >= 0;
        }).map(key => {
            params[key] = container[key];
        });
        index = index.filter(key => {
            return !params[key]
        });

        if (index.length > 0) {
            let status = {};
            switch (index[0]) {
                case 'phone' :
                    status = {code: 1001, msg: '请输入需查询人的电话'};
                    break;
                case 'name' :
                    status = {code: 1002, msg: '请输入需查询人的名字'};
                    break;
                case 'idNumber' :
                    status = {code: 1003, msg: '请输入需查询人的身份证'};
                    break;
                case 'method' :
                    status = {code: 1004, msg: '请输入查询方式'};
                    break;
            }
            util.res_error(res, status.code, status.msg);
        } else {
            return params;
        }
    }

    async sign(params) {
        let sign = Object.keys(params).sort().map(function (key) {
            return key + '=' + params[key];
        }).join("&");

        return private_key.sign(sign, 'base64', 'utf-8');
    }

    async search(res, method, json) {
        let self = this;
        let params = {};
        params['method'] = method;
        params['app_id'] = this.app_id;
        params['version'] = this.version;
        params['sign_type'] = this.sign_type;
        params['format'] = this.format;
        params['timestamp'] = Date.now();
        params['biz_data'] = json;
        this.signCB = async function (sign) {
            params['sign'] = sign;
            let json = await this.fetch_https('https://openapi.rong360.com/gateway', params, 'POST');
            if (json.error === 200) {
                util.res_success(res, 0, '', json.tianji_api_tianjireport_collectuser_response)
            } else {
                util.res_error(res, 9998, json)
            }
        };
        this.sign(params).then(sign => {
            self.signCB(sign);
        });
    }
}

module.exports = new riskComponent();