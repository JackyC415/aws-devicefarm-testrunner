const Test = require('../models/TestRunnerSchema/Test');
const deviceFarm = require('../services/deviceFarm');

module.exports = (app) => {

    /**
   var params = {
        name: "MyRun",
        devicePoolArn: "arn:aws:devicefarm:us-west-2:123456789101:pool:EXAMPLE-GUID-123-456", // You can get the Amazon Resource Name (ARN) of the device pool by using the list-pools CLI command.
        projectArn: "arn:aws:devicefarm:us-west-2:123456789101:project:EXAMPLE-GUID-123-456", // You can get the Amazon Resource Name (ARN) of the project by using the list-projects CLI command.
        test: {
            type: "APPIUM_JAVA_JUNIT",
            testPackageArn: "arn:aws:devicefarm:us-west-2:123456789101:test:EXAMPLE-GUID-123-456"
        }
     */
    app.post('/aws-service/projects/:projectid/testsuite/:testsuiteid/test-package/user/:userid', async (req, res) => {
        const { title, type } = req.body;
        const testSuiteId = req.params.testsuiteid;
        const userId = req.params.userid;
        const testSuite = await TestSuite.findOne({
            _id: testSuiteId
        });

        if (!testSuite) {
            res.status(400).send('Bad Request');
        }
        var params = {
            name: title,
            type,
            projectArn: testSuite.projectArn

        }
        devicefarm.scheduleRun(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        })

    });
}