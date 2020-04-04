const express = require('express');
const Upload = require('../models/TestRunnerSchema/Upload');
const deviceFarm = require('../services/deviceFarm');
const router = express.Router();

router.post('/aws-testrunner/getDevices', (req, res) => {

    var params = {
        type: "PRIVATE",
        projectArn: 'arn:aws:devicefarm:us-west-2:501375891658:project:a1492621-3550-4b69-990b-72657904499a'
    }

    deviceFarm.listDevicePools(params, async function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            Upload.findOne({ appName: req.session.runName }, (err, app) => {
                if (err) console.log(err, err.stack); // an error occurred
                else if (app) {
                    //default TOP-devices for now, user may create custom later
                    app.deviceArn = data.devicePools[0].arn;
                    app.save((err) => {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log("Device saved to MongoDB status: 'SUCCEEDED'");
                    })
                }
            });
        }
    });

});

module.exports = router;
