const express = require('express');
const Upload = require('../models/TestRunnerSchema/Upload');
const deviceFarm = require('../services/deviceFarm');
//const resourceTagging = require('../services/resourceTagging');
const s3 = require('../services/s3');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const request = require('request');
const path = require('path');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

//multer S3 instead of local storage (will be used during integration/deployment)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'cmpe281-impact-bucket',
        metadata: function (req, file, cb) {
            var fileExt = path.extname(file.originalname);
            if (fileExt == ".ipa" || fileExt == ".apk" || fileExt == '.zip') {
                cb(null, { fieldName: file.fieldname });
            } else {
                cb(null, false);
                return cb(new Error('Allowed only .apk .ipa .zip'));
            }
        },
        key: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
});

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
                    appUpload.save(err => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log("App upload saved to MongoDB status: " + res.status);
                    })
                } else {
                    //update current upload of test package
                    Upload.findOne({ appName: uname }, (err, test) => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else if (test) {
                            const testres = test.testPackage;
                            testres.name = res.name;
                            testres.arn = res.arn;
                            testres.type = res.type;
                            testres.url = res.url;
                            testres.status = res.status;
                            testres.created = res.created;
                            console.log(test);
                            test.save(err => {
                                if (err) console.log(err, err.stack); // an error occurred
                                else console.log("Test upload saved to MongoDB status: " + res.status);
                            });
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
        name: file.key,
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
                s3.getObject({ Bucket: file.bucket, Key: file.key }, function (err, s3_obj) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        let options = {
                            headers: {},
                            method: 'PUT',
                            url: data.upload.url,
                            body: s3_obj.Body
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
        async function (data) {
            //res.status(200).send("Devices listed!");
            await Upload.findOne({ appName: runName }, (err, app) => {
                if (err) console.log(err, err.stack); // an error occurred
                else if (app) {
                    console.log(data);
                    //default TOP-devices for now, user may create custom later
                    app.deviceArn = data.devicePools[0].arn;
                    app.save((err) => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else {
                            console.log("Device saved to MongoDB status: 'SUCCEEDED'");
                        }
                    });
                }
            });
            return "SUCCEEDED";
        }, function (error) {
            console.error("Upload status: ERROR", error);
        }
    );
}

async function scheduleRun(runName) {

    await Upload.findOne({ appName: runName }, (err, run) => {
        if (err) console.log(err, err.stack); // an error occurred
        else if (run) {
            var testType = run.testPackage.type.replace("_TEST_PACKAGE", "");
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

            deviceFarm.scheduleRun(params, async function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else if (data) {
                    console.log(data);  // successful response
                    let runStatus = await getRun(data.run.arn);
                    while (runStatus !== "COMPLETED") {
                        await sleep(60000);
                        runStatus = await getRun(data.run.arn);
                    }
                    /*
                    //apply resource tag
                    let resourceArn = data.arn;
                    let tags = {
                        projectName: "Impact",
                        type: "testrun"
                    }
                    tagResource(resourceArn, tags);*/
                }
            });
        }
    });
}

async function getRun(runArn) {
    return await deviceFarm.getRun({ arn: runArn }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else if (data.run.status === "COMPLETED") {
            console.log('TEST RUN COMPLETED!');
        }
        console.log("Get run status: " + data.run.status);
        return data.run.status;
    });
}


async function tagResource(resourceArn, tags) {
    var params = {
        ResourceARNList: [resourceArn],
        Tags: tags
    };
    resourceTagging.tagResources(params, function (err, data) {
        if (err) res.status(400).send(error.stack);
        else {
            console.log('tagged!');
            res.send("tagged");
        }
    });
}

router.post('/aws-testrunner/run', async (req, res) => {

    let getDeviceStatus = await getDevicePools(req.session.runName);
    while (getDeviceStatus !== "SUCCEEDED") {
        console.log("Re-attempt get device status: 'PROCESSING'");
        await sleep(5000);
        getDeviceStatus = await getDevicePools(req.session.runName);
    }
    scheduleRun(req.session.runName);
});

router.get('/aws-testrunner/listruns', (req, res) => {

    //let projectArn = req.body;
    let projectArn = 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a';

    deviceFarm.listRuns({ arn: projectArn }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data); // successful response
            res.status(200).send(data);
        }
    });
});

router.get('/aws-testrunner/getrun/*', (req, res) => {

    let runArn = Object.values(req.params)[0];
    console.log(runArn);
    deviceFarm.getRun({ arn: runArn }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data); // successful response
            res.status(200).send(data);
        }
    });
});

module.exports = router;