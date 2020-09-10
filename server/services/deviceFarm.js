const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region:'us-west-2'
});

var deviceFarm = new AWS.DeviceFarm();

module.exports = deviceFarm;
