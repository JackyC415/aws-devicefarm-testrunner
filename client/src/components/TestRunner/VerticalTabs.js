import React, { Component } from 'react';
import { Col, Nav, Tab, Row } from 'react-bootstrap';
import AppUpload from './AppUpload';
import AppConfig from './AppConfig';
import AppDevice from './AppDevice';
import AppStart from './AppStart';
import AppDeviceState from './AppDeviceState';

class VerticalTabs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <h1>Impact TestRunner</h1>
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="first">Choose application</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="second">Configure</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="third">Select devices</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fourth">Specify device state</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fifth">Review and start run</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <div>
                    <AppUpload />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <AppConfig />
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  <AppDevice />
                </Tab.Pane>
                <Tab.Pane eventKey="fourth">
                  <AppDeviceState />
              </Tab.Pane>
                <Tab.Pane eventKey="fifth">
                  <AppStart />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    )
  }
}

export default VerticalTabs;