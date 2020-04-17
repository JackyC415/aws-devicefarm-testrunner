const AWS = require('aws-sdk');

AWS.config.update({
    bucketName: 'cmpe281-impact-bucket',
    accessKeyId: 'AKIAXJPCU7DFLPE3R6NL',
    secretAccessKey: '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',
    region:'us-west-1'
});

var s3 = new AWS.S3();

module.exports = s3;