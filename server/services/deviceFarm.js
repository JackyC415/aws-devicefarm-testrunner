const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'AKIAXJPCU7DFLPE3R6NL',
    secretAccessKey: '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',
    region:'us-west-2'
});

var deviceFarm = new AWS.DeviceFarm();
module.exports = deviceFarm;