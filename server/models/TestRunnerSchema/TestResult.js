const mongoose = require('mongoose');
const { Schema } = mongoose;

const testResultSchema = new Schema({
    status: {
        type: String,
        emum: ['PENDING', 'PENDING_CONCURRENCY', 'PENDING_DEVICE', 'PROCESSING',
            'SCHEDULING', 'PREPARING', 'RUNNING', 'COMPLETED', 'STOPPING'],
        default: null
    },
    name: String,
    created: Date,
    platform: {
        type: String,
        emum: ['ANDROID_APP', 'IOS_APP', 'WEB_APP'],
        default: null
    },
    result: {
        type: String,
        emum: ['PENDING', 'PASSED', 'WARNED', 'FAILED', 'SKIPPED',
            'ERRORED', 'STOPPED'],
        default: null
    },
    billingMethod: String,
    type: {
        type: String,
        emum: ["BUILTIN_FUZZ", "BUILTIN_EXPLORER", "APPIUM_JAVA_JUNIT", "APPIUM_JAVA_TESTING",
            "APPIUM_PYTHON", "APPIUM_NODE", "APPIUM_RUBY", "APPIUM_WEB_JAVA_JUNIT", "APPIUM_JAVA_TESTING",
            "APPIUM_WEB_PYTHON", "APPIUM_WEB_NODE", "APPIUM_WEB_RUBY", "CALABASH", "INSTRUMENTATION",
            "UIAUTOMATION", "UIAUTOMATOR", "XCTEST", "XCTEST_UI"],
        default: 'BUILTIN_FUZZ'
    },
    arn: String,
    counters: [{
        total: Integer,
        passed: Integer,
        failed: Integer,
        warned: Integer,
        errored: Integer,
        stopped: Integer,
        skipped: Integer
    }],
    deviceMinutes: [{
        total: Float32Array,
        metered: Float32Array,
        unmetered: Float32Array
    }],
    userId: String
});

mongoose.model('TestResult', testResultSchema);