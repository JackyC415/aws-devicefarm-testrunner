const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    appName: String,
    appArn: String,
    appType: {
        type: String,
        emum: ["ANDROID_APP", "IOS_APP"],
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
            emum: ["BUILTIN_FUZZ", "BUILTIN_EXPLORER", "APPIUM_JAVA_JUNIT", "APPIUM_JAVA_TESTING",
                "APPIUM_PYTHON", "APPIUM_NODE", "APPIUM_RUBY", "APPIUM_WEB_JAVA_JUNIT", "APPIUM_JAVA_TESTING",
                "APPIUM_WEB_PYTHON", "APPIUM_WEB_NODE", "APPIUM_WEB_RUBY", "CALABASH", "INSTRUMENTATION",
                "UIAUTOMATION", "UIAUTOMATOR", "XCTEST", "XCTEST_UI"],
            default: 'BUILTIN_FUZZ'
        },
        status: {
            type: String,
            enum: ["FAILED", "INITIALIZED", "PROCESSING", "SUCCEEDED"]
        },
        url: String,
        created: { type: Date, default: Date.now }
    },
    ownerId: String
});

module.exports = Upload = mongoose.model("upload", uploadSchema);