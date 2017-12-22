let xml2js = require('xml2js');

Array.prototype.del = function (n) {
    if (n < 0) return this; else return this.slice(0, n).concat(this.slice(n + 1, this.length));
};

exports.buildXML = function (json) {
    let builder = new xml2js.Builder();
    return builder.buildObject(json);
};

exports.parseXML = function (xml, fn) {
    let parser = new xml2js.Parser({trim: true, explicitArray: false, explicitRoot: false});
    parser.parseString(xml, fn || function (err, result) {
    });
};

exports.parseRaw = function () {
    return function (req, res, next) {
        let buffer = [];
        req.on('data', function (trunk) {
            buffer.push(trunk);
        });
        req.on('end', function () {
            req.rawbody = Buffer.concat(buffer).toString('utf8');
            next();
        });
        req.on('error', function (err) {
            next(err);
        });
    }
};

exports.pipe = function (stream, fn) {
    let buffers = [];
    stream.on('data', function (trunk) {
        buffers.push(trunk);
    });
    stream.on('end', function () {
        fn(null, Buffer.concat(buffers));
    });
    stream.once('error', fn);
};

exports.mix = function () {
    let root = arguments[0];
    if (arguments.length == 1) {
        return root;
    }
    for (let i = 1; i < arguments.length; i++) {
        for (let k in arguments[i]) {
            root[k] = arguments[i][k];
        }
    }
    return root;
};

exports.generateNonceString = function (length) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    let noceStr = "";
    for (let i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};

exports.res_success = function (res, status = 0, msg = '', options = {}) {
    res.json({
        msg,
        status,
        result: options
    })
};
exports.res_error = function (res, status = 1, error = '') {
    console.log(error);
    res.json({
        status,
        error
    })
};