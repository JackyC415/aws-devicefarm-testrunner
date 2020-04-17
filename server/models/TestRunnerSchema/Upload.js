const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    appName: String,
    appArn: String,
    appType: {
        type: String,
        emum: ["ANDROID_APP", "IOS_APP", "WEB_APP"],
        default: null
    },
    appStatus: {
        type: String,
        enum: ["FAILED", "INITIALIZED", "PROCESSING", "SUCCEEDED"],
        default: null
    },
    appUrl: String,
    appCreated: { type: Date, default: Date.now },
    testPackage: {
        name: String,
        arn: String,
        type: {
            type: String,
            emum: ["ANDROID_APP", "IOS_APP", "WEB_APP", "APPIUM_JAVA_JUNIT_TEST_PACKAGE", "APPIUM_JAVA_TESTNG_TEST_PACKAGE",
                "APPIUM_PYTHON_TEST_PACKAGE", "APPIUM_NODE_TEST_PACKAGE", "APPIUM_RUBY_TEST_PACKAGE", "APPIUM_WEB_JAVA_JUNIT_TEST_PACKAGE",
                "APPIUM_WEB_JAVA_TESTNG_TEST_PACKAGE", "APPIUM_WEB_PYTHON_TEST_PACKAGE", "APPIUM_WEB_NODE_TEST_PACKAGE", "APPIUM_WEB_RUBY_TEST_PACKAGE", 
                "CALABASH_TEST_PACKAGE", "INSTRUMENTATION_TEST_PACKAGE","UIAUTOMATION_TEST_PACKAGE", "UIAUTOMATOR_TEST_PACKAGE", "XCTEST_TEST_PACKAGE", 
                "XCTEST_UI_TEST_PACKAGE", "UIAUTOMATOR", "APPIUM_NODE", "APPIUM_WEB_RUBY", "APPIUM_WEB_PYTHON", "CALABASH", "APPIUM_JAVA_JUNIT", "APPIUM_JAVA_TESTNG"]
        },
        status: {
            type: String,
            enum: ["FAILED", "INITIALIZED", "PROCESSING", "SUCCEEDED"]
        },
        url: String,
        created: { type: Date, default: Date.now }
    },
    deviceArn: {
        type: String,
        default: null
    },
    ownerId: String
});

module.exports = Upload = mongoose.model("upload", uploadSchema);