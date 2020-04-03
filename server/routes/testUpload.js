const express = require('express');
const Upload = require('../models/TestRunnerSchema/Upload');
const deviceFarm = require('../services/deviceFarm');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './files',
    filename(req, file, cb) {
        var fileExt = path.extname(file.originalname);
        if (fileExt != null) {
            if (fileExt == ".ipa" || fileExt == ".apk" || fileExt == '.zip') {
                cb(null, `${file.originalname}`);
            } else {
                cb(null, false);
                return cb(new Error('Allowed only .apk .ipa .zip'));
            }
        } else {
            return;
        }
    }
});
const upload = multer({ storage });
const request = require('request');
const path = require('path');
const fs = require('fs');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

async function getAppUpload(uploadArn, userId) {
    return await deviceFarm.getUpload({ arn: uploadArn }).promise().then(
        function (data) {
            var res = data.upload;
            if (res.status !== "SUCCEEDED") {
                console.log("Awaiting upload status: 'SUCCEEDED'");
            } else {
                if (res.type == 'ANDROID_APP' || res.type == 'IOS_APP') {
                    const appUpload = new Upload({
                        appName: res.name,
                        appArn: res.arn,
                        appType: res.type,
                        appUrl: res.url,
                        appStatus: res.status,
                        appCreated: res.created,
                        ownerId: userId
                    });
                    try {
                        appUpload.save();
                        console.log("App upload saved to MongoDB status: 'SUCCEEDED'");
                    } catch (err) {
                        console.log("App upload saved to MongoDB status: 'FAILED");
                    }
                } else {
                    console.log('SHOULD NOT BE IN HERE...');
                    //update current upload of test package
                    Upload.findOne({ appName: res.appName }, (err, test) => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else if (test) {
                            const testres = test.testPackage;
                            testres.name = res.name;
                            testres.arn = res.arn;
                            testres.type = res.type;
                            testres.url = res.url;
                            testres.status = res.status;
                            testres.created = res.created;
                            test.save((err) => {
                                if (err) console.log(err, err.stack); // an error occurred
                                else console.log("Test package upload saved to MongoDB status: 'SUCCEEDED'");
                            })
                        }
                    });
                }
            }
            return res.status;
        }, function (error) {
            console.error("App upload status: 'ERROR'", error);
        }
    );
}

router.post('/aws-testrunner/createUpload', upload.single('file'), (req, res) => {
    const file = req.file; // file passed from client
    const body = req.body;
    let userId = "Jack";
    let fileExtension = path.extname(file.originalname);
    console.log(file);

    var fileType = null;
    if (fileExtension == '.apk') {
        fileType = "ANDROID_APP";
    } else if (fileExtension == '.ipa') {
        fileType = "IOS_APP";
    } else {
        fileType = body.type;
    }

    var params = {
        name: file.originalname,
        type: fileType,
        projectArn: 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a'
    }

    deviceFarm.createUpload(params, async function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if (data.upload.status !== "INITIALIZED") {
                res.status(400).send('Bad Request');
                return;
            } else {
                let options = {
                    method: 'PUT',
                    url: data.upload.url,
                    headers: {},
                    body: fs.readFileSync(file.path)
                };

                //upload file to S3 with presigned url
                request(options, function (error, response) {
                    if (!error && response.statusCode == 200) {
                        console.log("App upload to AWS S3 status: 'SUCCEEDED'");
                    } else {
                        console.log(error);
                    }
                });

                //get status of app upload and persist data into mongoDB (retry if necessary)
                let uploadStatus = await getAppUpload(data.upload.arn, userId);
                while (uploadStatus !== "SUCCEEDED") {
                    await sleep(5000);
                    uploadStatus = await getAppUpload(data.upload.arn, userId);
                }

            }
        }
    });

});

module.exports = router;
