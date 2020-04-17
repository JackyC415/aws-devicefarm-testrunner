import React, { Component } from 'react';
import axios from 'axios';
import { Accordion, Card, Button, Nav } from 'react-bootstrap';

class AppStart extends Component {
    constructor(props) {
        super(props);
    }

    handleRunTest = (e) => {
        axios.post('/aws-testrunner/run', null).then((response) => {
            console.log(response); // do something with the response
        });
        this.props.handleModal();
    }

    render() {
        return (
            <div>
                <h2>Review and start run</h2>
                <br></br>
                <div>Review your run below. Look good? Confirm to start your run. Interested in unlimited, unmetered testing?
                <Nav.Item>
                        <Nav.Link eventKey="link-1">Learn more</Nav.Link>
                    </Nav.Item>
                </div>
                <br></br>
                <Accordion>
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                Application
                        </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body><strong>Name</strong> demo.apk</Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                Test
                    </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body><Card.Body><strong>Type</strong> Appium_TestNG</Card.Body></Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="2">
                                Devices
                    </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body><Card.Body><strong>Pool</strong> Top Devices</Card.Body></Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>

                <Button onClick={this.handleRunTest.bind(this)} variant="outline-success">Confirm and start run</Button>{' '}
            </div>

        )
    }
}

export default AppStart;