import React, { Component } from 'react';
import { Form, Table, Card } from 'react-bootstrap';

class AppDevice extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <h2>Select devices</h2>
                <br></br>
                <div>Select from one of the available device pools or create a new device pool.</div>
                <Form>
                    <br></br>
                    <h5><strong>Device pool</strong></h5>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Control as="select">
                            <option>Top Devices</option>
                            <option>Web Performance</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
                <br></br>
                <Card body><p><strong>100% Compatibility</strong></p>
                    Your app is compatible with 5 out of 5 devices in the selected pool.</Card>
                <br></br>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Device</th>
                            <th>OS</th>
                            <th>Reason</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Google Pixel 2</td>
                            <td>8.0.0</td>
                            <td></td>
                            <td>HIGHLY_AVAILABLE</td>
                        </tr>
                        <tr>
                            <td>Google Pixel 4 XL (Unlocked)</td>
                            <td>10</td>
                            <td></td>
                            <td>HIGHLY_AVAILABLE</td>
                        </tr>
                        <tr>
                            <td>Samsung Galaxy S10+</td>
                            <td>9</td>
                            <td></td>
                            <td>HIGHLY_AVAILABLE</td>
                        </tr>
                        <tr>
                            <td>Google Pixel 4 (Unlocked)</td>
                            <td>10</td>
                            <td></td>
                            <td>HIGHLY_AVAILABLE</td>
                        </tr>
                        <tr>
                            <td>Samsung Galaxy Tab S6 (WiFi)</td>
                            <td>9</td>
                            <td></td>
                            <td>HIGHLY_AVAILABLE</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default AppDevice;