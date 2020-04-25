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
    this.state = {
      tabsEnabled: false
    }
    this.tabsHandler = this.tabsHandler.bind(this);
    this.handleModal = this.handleModal.bind(this);
  }

  tabsHandler(arg) {
    if (arg) {
      console.log('tabs enabled!');
      this.setState({ tabsEnabled: arg });
    } else {
      console.log('tabs disabled!');
      this.setState({ tabsEnabled: arg });
    }
  }

  handleModal() {
    this.props.closeModal();
  }

  render() {
    let tabsAble = null;
    if (this.state.tabsEnabled) {
      tabsAble = <div>
        <Nav.Item>
          <Nav.Link eventKey="second" enabled>Configure</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="third" enabled>Select devices</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="fourth" enabled>Specify device state</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="fifth" enabled>Review and start run</Nav.Link>
        </Nav.Item>
      </div>
    } else {
      tabsAble = <div>
        <Nav.Item>
          <Nav.Link eventKey="second" disabled>Configure</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="third" disabled>Select devices</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="fourth" disabled>Specify device state</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="fifth" disabled>Review and start run</Nav.Link>
        </Nav.Item>
      </div>
    }
    return (
      <div>
        <Tab.Container id="left-tabs-example" defaultActiveKey={"first"}>
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="first">Choose application</Nav.Link>
                </Nav.Item>
                {tabsAble}
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <AppUpload tabsHandler={this.tabsHandler} />
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <AppConfig tabsHandler={this.tabsHandler} />
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  <AppDevice />
                </Tab.Pane>
                <Tab.Pane eventKey="fourth">
                  <AppDeviceState />
                </Tab.Pane>
                <Tab.Pane eventKey="fifth">
                  <AppStart handleModal={this.handleModal} />
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