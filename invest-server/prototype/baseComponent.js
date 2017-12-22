let fetch = require('node-fetch');
let Ids = require('../models/Ids');

class BaseComponent {
    constructor() {
        this.idList = ['orderId', 'userId', 'cartId', 'storeId'];
    }

    //网络请求
    async fetch(url = '', data = {}, type = 'GET', resType = 'JSON') {
        type = type.toUpperCase();
        resType = resType.toUpperCase();
        if (type == 'GET') {
            let dataStr = ''; //数据拼接字符串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            });

            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = url + '?' + dataStr;
            }
        }

        let requestConfig = {
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };

        if (type == 'POST') {
            Object.defineProperty(requestConfig, 'body', {
                value: JSON.stringify(data)
            })
        }

        let responseJson;
        try {
            const response = await fetch(url, requestConfig);
            if (resType === 'TEXT') {
                responseJson = await response.text();
            } else {
                responseJson = await response.json();
            }
        } catch (err) {
            console.log('获取http数据失败', err);
            throw new Error(err)
        }
        return responseJson
    }

    //网络请求https
    async fetch_https(url = '', data = {}, type = 'GET') {
        let requestConfig = {
            protocol: 'https:',
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };
        type = type.toUpperCase();
        if (type === 'GET') {
            let dataStr = ''; //数据拼接字符串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            });

            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = url + '?' + dataStr;
            }
        } else {
            Object.defineProperty(requestConfig, 'body', {
                value: JSON.stringify(data)
            })
        }
        let responseJson;
        try {
            const response = await fetch(url, requestConfig);
            responseJson = await response.json();
        } catch (err) {
            console.log('获取http数据失败', err);
            throw new Error(err)
        }
        return responseJson
    }

    //获取id列表
    async getId(type) {
        return new Promise((resolve, reject) => {
            if (!this.idList.includes(type)) {
                reject('id类型错误');
            }
            try {
                Ids.findOne(function (err, doc) {
                    doc[type]++;
                    doc.save();
                    resolve(doc[type]);
                });
            } catch (err) {
                console.log('获取ID数据失败');
                reject(err)
            }
        });
    }
}

module.exports = BaseComponent;