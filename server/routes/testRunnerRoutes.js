const express = require('express');
const Upload = require('../models/TestRunnerSchema/Upload');
//const TestResult = require('../models/TestRunnerSchema/TestResult');
const deviceFarm = require('../services/deviceFarm');
const resourceTagging = require('../services/resourceTagging');
const s3 = require('../services/s3');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const request = require('request');
const path = require('path');
const fs = require('fs');
const postmanRequest = require('postman-request');
const EasyZip = require('easy-zip').EasyZip;
const zip5 = new EasyZip();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
//will be replaced by create project (when integrated)
const projectArn = 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a';

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
                        if (err) console.log(err, err.stack);
                        else console.log("App upload saved to MongoDB status: " + res.status);
                    })
                } else {
                    //update current upload of test package
                    Upload.findOne({ appName: uname }, (err, test) => {
                        if (err) console.log(err, err.stack);
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
                                if (err) console.log(err, err.stack);
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

    let fileType = null;
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
        projectArn: projectArn
    }

    deviceFarm.createUpload(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            console.log(data);
            let uploadStatus = data.upload.status;
            let uploadArn = data.upload.arn;

            if (uploadStatus !== "INITIALIZED") {
                res.status(400).send('Bad Request');
                return;
            } else {
                console.log("Create upload status: " + uploadStatus);
                s3.getObject({ Bucket: file.bucket, Key: file.key }, function (err, s3_obj) {
                    if (err) console.log(err, err.stack);
                    else {
                        let options = {
                            headers: {},
                            method: 'PUT',
                            url: data.upload.url,
                            body: s3_obj.Body
                        };
                        //upload file to S3 with presigned url
                        request(options, async function (error, response) {
                            if (!error && response.statusCode === 200) {
                                console.log("Upload to S3 w/ presigned url status: " + uploadStatus);
                                //get status of app upload and persist data into mongoDB (retry if necessary)
                                let getUploadStatus = await getAppUpload(uploadArn, userId, req.session.runName);
                                while (getUploadStatus !== "SUCCEEDED") {
                                    console.log("Re-attempt get upload status: " + getUploadStatus);
                                    await sleep(5000);
                                    getUploadStatus = await getAppUpload(uploadArn, userId, req.session.runName);
                                }
                                res.status(200).send(file);
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
    return await deviceFarm.listDevicePools({ arn: projectArn }).promise().then(
        async function (data) {
            //res.status(200).send("Devices listed!");
            await Upload.findOne({ appName: runName }, (err, app) => {
                if (err) console.log(err, err.stack);
                else if (app) {
                    console.log(data);
                    //default TOP-devices for now, user may create custom later
                    app.deviceArn = data.devicePools[0].arn;
                    app.save((err) => {
                        if (err) console.log(err, err.stack);
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
        if (err) console.log(err, err.stack);
        else if (run) {
            var testType = run.testPackage.type.replace("_TEST_PACKAGE", "");
            var params = {
                name: run.appName,
                appArn: run.appArn,
                devicePoolArn: run.deviceArn,
                projectArn: projectArn,
                test: {
                    type: testType,
                    testPackageArn: run.testPackage.arn
                }
            }

            deviceFarm.scheduleRun(params, async function (err, data) {
                if (err) console.log(err, err.stack);
                else if (data) {
                    console.log(data);
                    let runResult = await getRun(data.run.arn);
                    while (runResult !== "PASSED" || runResult !== "FAILED") {
                        await sleep(60000);
                        runResult = await getRun(data.run.arn);
                    }
                }
            });
        }
    });
}

async function getRun(runArn) {
    return await deviceFarm.getRun({ arn: runArn }, function (err, data) {
        let runResult = data.run.result;
        if (err) console.log(err, err.stack);
        else if (runResult === "PASSED" || runResult === "FAILED") {
            let tags = {
                "projectName": "Impact",
                "type": "testrun"
            }
            tagResource(runArn, tags); //apply resource tag
            //saveTestResult(data); //save test result to db
            getRunArtifacts2(runArn); //get run artifacts
            console.log('TEST RUN COMPLETED!');
        } else if (runResult !== "PENDING") {
            runResult = "OTHERS";
        }
        console.log("Get run result: " + runResult);
        return runResult;
    });
}

async function saveTestResult(data) {
    TestResult.save(data, (err, res) => {
        if (err) console.log(err, err.stack);
        else console.log('Test result saved.');
        console.log(data);
    });
}

async function tagResource(resourceArn, tags) {
    var params = {
        ResourceARNList: [resourceArn],
        Tags: tags
    };
    resourceTagging.tagResources(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log('Resource tagged!');
    });
}

async function getRunArtifacts2(runArn) {
    var params = {
        arn: runArn,
        type: "FILE"
    }
    let urlArray = [];
    var gotUrls = new Promise((resolve, reject) => {
        deviceFarm.listArtifacts(params, (err, data) => {
            if (err) console.log(err, err.stack);
            else if (data) {
                data.artifacts.forEach(function (obj) {
                    if (obj.name === 'Appium Java XML Output') {
                        urlArray.push(obj.url);
                    }
                });
                resolve();
            }
        });
    });
    gotUrls.then(() => {
        let index = runArn.lastIndexOf('/');
        let runName = runArn.substring(index + 1);
        importArtifactToRP2(urlArray, runName);
    });
}

async function importArtifactToRP2(urlArray, dir) {

    let directory = './' + dir;
    fs.mkdirSync(directory);
    var stream = new Promise((resolve, reject) => {
        urlArray.forEach(function (url, index) {
            let stream = request(url).pipe(fs.createWriteStream(directory + "/test" + index + ".xml"));
            stream.on('finish', function () {
                resolve();
            });
        });
    });

    stream.then(async () => {
        await sleep(10000);
        zip5.zipFolder(directory, function () {
            zip5.writeToFile(directory + '.zip', function (err) {
                if (err) throw err;
                else {
                    var options = {
                        'method': 'POST',
                        'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
                        'headers': {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 094d6196-ec57-41da-ad25-499fb6a4cdf3'
                        },
                        formData: {
                            'file': {
                                'value': fs.createReadStream(directory + '.zip'),
                                'options': {
                                    'filename': directory + '.zip',
                                    'contentType': null
                                }
                            }
                        }
                    };
                    postmanRequest(options, function (error, response) {
                        if (error) throw new Error(error);
                        console.log(response);
                    });
                }
            });
        });
    });
}

/*
async function getRunArtifacts(runArn) {
    var params = {
        arn: runArn,
        type: "FILE"
    }
    deviceFarm.listArtifacts(params, (err, data) => {
        if (err) console.log(err, err.stack);
        else if (data) {
            //get artifacts file urls and upload them to S3 via request
            data.forEach(async function (obj, index) {
                if (obj.name === 'Appium Java XML Output') {
                    let filename = 'artifact' + index + '.zip';
                    //local version
                    await importArtifactsToRP(obj.url, filename);
                    
                    //remote version in progress
                    let options = {
                        uri: obj.url,
                        encoding: null
                    };
                    request(options, async function (err, res, body) {
                        if (err || res.statusCode !== 200) {
                            console.log(err, err.stack);
                        } else {
                            await uploadArtifactToS3(body, filename);
                        }
                    });
                }
            });
        }
    })

}*/

/*
//remote version in progress
async function uploadArtifactToS3(body, filename) {

    s3.putObject({ Body: body, Key: filename, Bucket: 'cmpe281-impact-rp-bucket' }, async (err, data) => {
        if (err && res.statusCode !== 200) {
            console.log(err, err.stack);
        } else if (data) {
            console.log('Uploaded aritfact: ' + filename + ' to S3!');
            await importArtifactsToRP(filename);
        }
    });
}

async function importArtifactsToRP(url, filename) {

    let stream = request(url).pipe(fs.createWriteStream(filename));
    stream.on('finish', function () {
        var options = {
            'method': 'POST',
            'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 094d6196-ec57-41da-ad25-499fb6a4cdf3'
            },
            formData: {
                'file': {
                    'value': fs.createReadStream('./' + filename),
                    'options': {
                        'filename': filename,
                        'contentType': null
                    }
                }
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
    });
}*/

router.post('/aws-testrunner/run', async (req, res) => {

    let getDeviceStatus = await getDevicePools(req.session.runName);
    while (getDeviceStatus !== "SUCCEEDED") {
        console.log("Re-attempt get device status: " + getDeviceStatus);
        await sleep(5000);
        getDeviceStatus = await getDevicePools(req.session.runName);
    }
    scheduleRun(req.session.runName);
});

router.get('/aws-testrunner/listruns', (req, res) => {
    deviceFarm.listRuns({ arn: projectArn }, function (err, data) {
        if (err) console.log(err, err.stack);
        else res.status(200).send(data);
    });
});

router.get('/aws-testrunner/getrun/*', (req, res) => {

    let runArn = Object.values(req.params)[0];
    console.log(runArn);
    deviceFarm.getRun({ arn: runArn }, function (err, data) {
        if (err) console.log(err, err.stack);
        else res.status(200).send(data);
    });
});

module.exports = router;