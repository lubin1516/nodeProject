let express = require('express');
let router = express.Router();
let util = require('../library/util');
const WXAuth = require('wechat-auth');
const redis = require("redis"),
    redisClient = redis.createClient();

const appid = 'wx0e86a7db44c4c0c7';
const appsecret = 'b3c9b89e2c7182bf1acb62f9bfe9332c';

let getVerifyTicket = function (callback) {
    return redisClient.get('component_verify_ticket', function (err, ticket) {
        if (err) {
            return callback(err);
        } else if (!ticket) {
            return callback(new Error('no component_verify_ticket'));
        } else {
            return callback(null, ticket);
        }
    });
};

let getComponentToken = function (callback) {
    return redisClient.get('component_access_token', function (err, token) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, JSON.parse(token));
        }
    });
};

let saveComponentToken = function (token, callback) {
    return redisClient.setex('component_access_token', 7000, JSON.stringify(token), function (err, reply) {
        if (err) {
            callback(err);
        }
        return callback(null);
    });
};

const wxauth = new WXAuth(appid, appsecret, getVerifyTicket, getComponentToken, saveComponentToken);

router.use('/', function (req, res, next) {
    next();
});

router.use('/get_oauth_url', function (req, res) {
    let state = 'STATE#wechat_redirect';
    let scope = 'snsapi_userinfo';
    let redirect = 'http://vccar.cn:3006/';
    let oauthUrl = wxauth.getOAuthURL(appid, redirect, state, scope);
    util.res_success(res, 0, '', {oauthUrl});
});

module.exports = router;
