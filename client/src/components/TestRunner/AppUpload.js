import React, { Component } from 'react';
import { Col, Nav, Tab, Row, Form, Button } from 'react-bootstrap';
import axios from 'axios';

class AppUpload extends Component {
    constructor(props) {
        super(props);
        this.handleUploadFile = this.handleUploadFile.bind(this);
    }

    handleUploadFile = (event) => {
        const data = new FormData();
        data.append('file', event.target.files[0]);
        console.log(event.target.files[0].name);
        // '/files' is your node.js route that triggers our middleware
        axios.post('/aws-testrunner/createUpload', data).then((response) => {
            console.log(response); // do something with the response
        });
    }

    render() {
        return (
            <div>
                <h2>Choose your application</h2>
                <br></br>
                <div>
                    <div>
                        <input type="file" onChange={this.handleUploadFile} />
                    </div>
                    <br></br>
                    <h5>Run name: </h5>
                    <Form>
                        <Form.Group controlId="formGridAddress1">
                            <Form.Control placeholder="optional app name (file name will be used if not provided)" />
                        </Form.Group>
                    </Form>
                </div>
            </div>
        )
    }
}

export default AppUpload;