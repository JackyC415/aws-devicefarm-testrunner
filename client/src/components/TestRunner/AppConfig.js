'use strict';

import React, { Component } from 'react';
import { Col, Nav, Tab, Row, Form, Button } from 'react-bootstrap';

class AppUpload extends Component {
    constructor(props) {
        super(props);
    }
    render() {
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
                        <Form.Control as="select">
                            <option>Built-in: Fuzz</option>
                            <option>Built-in: Explorer</option>
                            <option>Appium Java JUnit</option>
                            <option>Appium Java Test NG</option>
                            <option>Appium Python</option>
                            <option>Appium Node.js</option>
                            <option>Appium Ruby</option>
                            <option>Calabash</option>
                            <option>Instrumentation</option>
                            <option>UI Automator</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
                <div><i>No tests? No problem. We'll fuzz test your app by sending random events to it with no scripts required.</i></div>
            </div>
        )
    }
}

export default AppUpload;