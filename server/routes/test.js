const request = require('postman-request');
const s3 = require('../services/s3');
const fs = require('fs');
const resourceTagging = require('../services/resourceTagging');
const EasyZip = require('easy-zip').EasyZip;
const zip5 = new EasyZip();
const deviceFarm = require('../services/deviceFarm');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

//get file url associated with a specific run and upload the file to S3
async function getRunArtifacts() {
    let fileUrl = 'https://prod-us-west-2-results.s3-us-west-2.amazonaws.com/501375891658/a7c0ed6c-00e0-4682-b88f-bc4429bcb264/6e0db770-36ab-448c-9931-067ea19cc409/00004/00001/00000/bf50fa7c-bf24-4110-8fc4-c71e50faf1a8.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200422T195739Z&X-Amz-SignedHeaders=host&X-Amz-Expires=259200&X-Amz-Credential=AKIAJSORV74ENYFBITRQ%2F20200422%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=f25f7d098fc25f54e575986e927565b4647449024b317b89bb54ea380d1bfcb7';

    let url = {
        uri: fileUrl,
        encoding: null
    };

    let s3Object = await s3.getObject({ Bucket: 'cmpe281-impact-bucket', Key: 'artifact.zip' });
    let streamData = s3Object.createReadStream();
    console.log(JSON.stringify(streamData));

    var options = {
        'method': 'POST',
        'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 2c80d897-e3ec-4998-a92a-a67746c84a22'
        },
        formData: {
            'file': {
                'value': JSON.stringify(streamData),
                'options': {
                    'filename': 'artifact.zip',
                    'contentType': null
                }
            }
        }
    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(response);
    });

    /*
    stream.on('data', function (data) {
        var options = {
            'method': 'POST',
            'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 0ccea3c8-5cdb-4e32-9112-1d6caee7fbed'
            },
            formData: {
                'file': {
                    'value': fs.createReadStream(JSON.stringify(data)),
                    'options': {
                        'filename': 'artifact.zip',
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

    /*
    //working version (locally)
    let stream = request(url).pipe(fs.createWriteStream('artifact'));
    stream.on('finish', function () {
        var options = {
            'method': 'POST',
            'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 2c80d897-e3ec-4998-a92a-a67746c84a22'
            },
            formData: {
                'file': {
                    'value': fs.createReadStream('./artifact'),
                    'options': {
                        'filename': 'artifact.zip',
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

    /*
   request(url, function (err, res) {
       if (err || res.statusCode !== 200) {
           console.log("failed to get file from url");
           console.log(err);
       } else {
           importArtifactToRP();
       }
   });*/
}

/*curl -X POST --header 'Content-Type: multipart/form-data' 
--header 'Accept: application/json' 
--header 'Authorization: bearer 0ccea3c8-5cdb-4e32-9112-1d6caee7fbed' 
-F file=@artifact.zip 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import'*/
async function importArtifactToRP() {

    //get artifact file from S3 and parse the body to POST request
    s3.getObject({ Bucket: 'cmpe281-impact-bucket', Key: 'artifact.zip' }, function (err, artifact) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            //let s = fs.createReadStream('/Users/jchen415/Downloads/artifact.zip');

            var options = {
                'method': 'POST',
                'url': 'https://web.demo.reportportal.io/api/v1/jackyc415_personal/launch/import',
                'headers': {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 0ccea3c8-5cdb-4e32-9112-1d6caee7fbed'
                },
                formData: {
                    'file': {
                        'value': JSON.stringify(artifact.Body),
                        'options': {
                            'filename': 'artifact.zip',
                            'contentType': null,
                            processData: false
                        }
                    }
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
            })
            //console.log(fs.createReadStream('/Users/jchen415/Downloads/artifact.zip'));

        }
    });
}


//getRunArtifacts();

//tagResource();

async function getRunArtifacts() {
    var params = {
        arn: 'arn:aws:devicefarm:us-west-2:501375891658:run:a1492621-3550-4b69-990b-72657904499a/339bbc4e-9206-4652-9b4b-37b49d29e8b8',
        type: "FILE"
    }
    let urlArray = [];
    var test = new Promise((resolve, reject) => {
        deviceFarm.listArtifacts(params, (err, data) => {
            if (err) console.log(err, err.stack);
            else if (data) {
                //get artifacts file urls and upload them to S3 via request
                data.artifacts.forEach(function (obj) {
                    if (obj.name === 'Appium Java XML Output') {
                        urlArray.push(obj.url);
                    }
                });
                resolve();
            }
        });
    });
    test.then(() => {
        importArtifactToRP2(urlArray, 'rofl');
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
        zip5.zipFolder('./' + dir, function () {
            zip5.writeToFile(directory+'.zip', function (err) {
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
                                'value': fs.createReadStream(directory+'.zip'),
                                'options': {
                                    'filename': directory+'.zip',
                                    'contentType': null
                                }
                            }
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        console.log(response);
                    });
                }
            });
        });
    });
}

async function importArtifactToRP(urlArray) {

    let directory = "./artifact";
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
        zip5.zipFolder('./artifact', function () {
            zip5.writeToFile('./artifact.zip', function (err) {
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
                                'value': fs.createReadStream('./artifact.zip'),
                                'options': {
                                    'filename': 'artifact.zip',
                                    'contentType': null
                                }
                            }
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        console.log(response);
                    });
                }
            });
        });
    });
}

//getRunArtifacts();