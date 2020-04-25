import React, { Component } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

class AppUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upload: false,
            testType: '',
            inProgress: false
        }
        this.handleUploadFile = this.handleUploadFile.bind(this);
    }

    handleChange = (e) => {
        if (e.target.value !== 'BUILTIN_FUZZ' && e.target.value !== 'BUILTIN_EXPLORER') {
            this.setState({ upload: true, testType: e.target.value });
            this.props.tabsHandler(false);
        } else {
            this.props.tabsHandler(true);
            this.setState({ upload: false });
        }
    }

    handleUploadFile = (e) => {
        const data = new FormData();
        data.append('file', e.target.files[0]);
        data.append('testType', this.state.testType);
        this.setState({ inProgress: true });
        // '/files' is your node.js route that triggers our middleware
        axios.post('/aws-testrunner/createUpload', data).then((res) => {
            if (res.status === 200) {
                console.log(res);
                this.props.tabsHandler(true);
                this.setState({ inProgress: false });
            }
        });
    }

    render() {
        let enableUpload = null;
        let progressBar = '';
        if (this.state.upload) {
            enableUpload =
                <Form>
                    <Form.File
                        id="custom-file"
                        label="Choose File"
                        onChange={this.handleUploadFile}
                        custom
                    />
                </Form>
        } else {
            enableUpload =
                <div><i>No tests? No problem. We'll fuzz test your app by sending random events to it with no scripts required.</i></div>
        }
        if (this.state.inProgress) {
            progressBar = <div>
                <Spinner animation="border" /> Upload in progress
            </div>
        }
        return (
            <div>
                <h2>Configure your test</h2>
                <br></br>
                <strong>Setup test framework</strong>
                <div>Select the test type you would like to use. If you do not have any scripts, select Built-in: Fuzz or Built-in: Explorer and we will fuzz test or explore your app.</div>
                <Form>
                    <br></br>
                    <h5>Test</h5>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Control as="select" onChange={this.handleChange.bind(this)}>
                            <option>BUILTIN_FUZZ</option>
                            <option>BUILTIN_EXPLORER</option>
                            <option>APPIUM_JAVA_JUNIT</option>
                            <option>APPIUM_JAVA_TESTNG</option>
                            <option>APPIUM_PYTHON</option>
                            <option>APPIUM_NODE</option>
                            <option>APPIUM_RUBY</option>
                            <option>CALABASH</option>
                            <option>INSTRUMENTATION</option>
                            <option>UIAUTOMATION</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
                {enableUpload}
                {progressBar}
            </div>
        )
    }
}

export default AppUpload;