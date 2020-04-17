import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

class AppDeviceState extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h2>Specify device state (Optional field) </h2>
                <br></br>
                <p>Specify settings to simulate real-world scenarios and device configurations.</p>
                <h5>Add extra data</h5>
                <p><input type="file" onChange={this.handleUploadFile} /></p>
                <h5>Install other apps</h5>
                <p><input type="file" onChange={this.handleUploadFile} /></p>
                <h5>Set radio states</h5>
                <div>
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="wifi"></input>
                        <label class="custom-control-label" for="wifi">WiFi</label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="bluetooth"></input>
                        <label class="custom-control-label" for="bluetooth">Bluetooth</label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="gps"></input>
                        <label class="custom-control-label" for="gps">GPS</label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="nfc"></input>
                        <label class="custom-control-label" for="nfc">NFC</label>
                    </div>
                </div>
                <h5>Device location</h5>
                <Form>
                    <Form.Group controlId="formGridAddress1">
                        <Form.Control placeholder="47.6204" />
                    </Form.Group>
                    <Form.Group controlId="formGridAddress1">
                        <Form.Control placeholder="-122.3491" />
                    </Form.Group>
                </Form>
                <h5>Paths to your files on the host machine and device</h5>
                <h6>Host Machine</h6>
                <Form>
                    <Form.Group controlId="formGridAddress1">
                        <Form.Control placeholder="$WORKING_DIRECTORY" />
                    </Form.Group>
                </Form>
                <h6>Android</h6>
                <Form>
                    <Form.Group controlId="formGridAddress1">
                        <Form.Control placeholder="" />
                    </Form.Group>
                </Form>
                <Form>
                    <h5>Device locale</h5>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Control as="select">
                            <option>English, US (en_US)</option>
                            <option>Arabic, Egypt (ar_EG)</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
                <Form>
                    <h5>Network profile</h5>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Control as="select">
                            <option>Full</option>
                            <option>3G Average</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}

export default AppDeviceState;