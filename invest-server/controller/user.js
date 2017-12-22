let baseComponent = require('../prototype/baseComponent');
let users = require('../models/users');
let util = require('../library/util');

class userComponent extends baseComponent {
    constructor() {
        super();
    }

    async create(req, res) {
        let {name, phone, identity} = Object.keys(req.query).length > 0 ? req.query : req.body;
        try {
            if (!name) throw new Error('请输入用户名！');
            if (!phone) throw new Error('请输入手机号');
            if (!identity) throw new Error('请输入身份证');
        } catch (e) {
            console.log(e);
            util.res_error(res, 1001, e.message);
        }

        users.findOne({phone, userName: undefined}).then(doc => {
            this.getId('userId').then(userId => {
                doc.userId = userId;
                doc.userName = name;
                doc.identity = identity;
                return doc.save();
            }).then(doc => {
                util.res_success(res, 0, '', doc)
            }).catch(err => {
                console.log(err.message);
                util.res_error(res, 9999, '保存失败');
            })
        }).catch(err => {
            console.log(err.message);
            util.res_error(res, 9999, '查找失败');
        })
    }
}

module.exports = new userComponent();
