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

async function getAppUpload(uploadArn, userId, uname) {
    return await deviceFarm.getUpload({ arn: uploadArn }).promise().then(
        function (data) {
            var res = data.upload;
            if (res.status === 'SUCCEEDED') {
                console.log("Upload status: " + res.status);
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
                        console.log("App upload saved to MongoDB status: " + res.status);
                    } catch (err) {
                        console.log("App upload saved to MongoDB status: 'FAILED");
                    }
                } else {
                    console.log('UNAME:' + uname);
                    //update current upload of test package
                    Upload.findOne({ appName: uname }, (err, test) => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else if (test) {
                            console.log("FOUND THE TEST ASSOCIATED WITH THIS RUN -" + uname);
                            const testres = test.testPackage;
                            testres.name = res.name;
                            testres.arn = res.arn;
                            testres.type = res.type;
                            testres.url = res.url;
                            testres.status = res.status;
                            testres.created = res.created;
                            console.log(test);
                            try {
                                test.save();
                                console.log("Test upload saved to MongoDB status: " + res.status);
                            } catch (err) {
                                console.log("Test upload saved to MongoDB status: 'FAILED");
                            }
                        }
                    });
                }
            }
            return res.status;
        }, function (error) {
            console.error("Upload status: ERROR", error);
        }
    );
}

router.post('/aws-testrunner/createUpload', upload.single('file'), (req, res) => {
    const file = req.file; // file passed from client
    let userId = "Jack";
    let fileExtension = path.extname(file.originalname);
    console.log(file);

    var fileType = null;
    if (fileExtension == '.apk') {
        fileType = "ANDROID_APP";
        req.session.runName = file.originalname;
    } else if (fileExtension == '.ipa') {
        fileType = "IOS_APP";
        req.session.runName = file.originalname;
    } else {
        fileType = req.body.testType + '_TEST_PACKAGE';
    }

    var params = {
        name: file.originalname,
        type: fileType,
        projectArn: 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a'
    }

    deviceFarm.createUpload(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data);
            if (data.upload.status !== "INITIALIZED") {
                res.status(400).send('Bad Request');
                return;
            } else {
                console.log("Create upload status: " + data.upload.status);
                let options = {
                    method: 'PUT',
                    url: data.upload.url,
                    headers: {},
                    body: fs.readFileSync(file.path)
                };

                //upload file to S3 with presigned url
                request(options, async function (error, response) {
                    if (!error && response.statusCode == 200) {
                        res.status(200).send("Created upload!");
                        console.log("Upload to S3 w/ presigned url status: " + data.upload.status);

                        //get status of app upload and persist data into mongoDB (retry if necessary)
                        let uploadStatus = await getAppUpload(data.upload.arn, userId, req.session.runName);
                        while (uploadStatus !== "SUCCEEDED") {
                            console.log("Re-attempt get upload status: " + uploadStatus);
                            await sleep(5000);
                            uploadStatus = await getAppUpload(data.upload.arn, userId, req.session.runName);
                        }
                    } else {
                        console.log(error);
                    }
                });
            }
        }
    });

});

async function getDevicePools(runName) {

    var params = {
        arn: 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a'
    }

    return await deviceFarm.listDevicePools(params).promise().then(
        function (data) {
            if (data) {
                //res.status(200).send("Device listed!");
                Upload.findOne({ appName: runName }, (err, app) => {
                    if (err) console.log(err, err.stack); // an error occurred
                    else if (app) {
                        console.log(data);
                        //default TOP-devices for now, user may create custom later
                        app.deviceArn = data.devicePools[0].arn;
                        app.save((err) => {
                            if (err) console.log(err, err.stack); // an error occurred
                            else {
                                console.log("Device saved to MongoDB status: 'SUCCEEDED'");
                                scheduleRun(runName);
                                return "SUCCEEDED";
                            }
                        });
                    }
                });
            }
        }, function (error) {
            console.error("Upload status: ERROR", error);
        }
    );
}

function scheduleRun(runName) {
    Upload.findOne({ appName: runName }, (err, run) => {
        if (err) console.log(err, err.stack); // an error occurred
        else if (run) {
            var testType = run.testPackage.type.replace("_TEST_PACKAGE", "");

            console.log(run.deviceArn);
            console.log(run.testPackage.arn);
            var params = {
                name: run.appName,
                appArn: run.appArn,
                devicePoolArn: run.deviceArn,
                projectArn: 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a',
                test: {
                    type: testType,
                    testPackageArn: run.testPackage.arn
                }
            }

            deviceFarm.scheduleRun(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else console.log(data);           // successful response
            });
        }
    });
}

router.post('/aws-testrunner/run', async (req, res) => {

    await getDevicePools(req.session.runName);

});

module.exports = router;