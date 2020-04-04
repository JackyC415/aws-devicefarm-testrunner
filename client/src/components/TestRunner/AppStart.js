'use strict';

import React, { Component } from 'react';
import axios from 'axios';

class AppStart extends Component {
    constructor(props) {
        super(props);
    }

    handleRunTest = (e) => {
        axios.post('/aws-testrunner/run', null).then((response) => {
            console.log(response); // do something with the response
        });
    }

    render() {
        return (
            <div>
                 <h2>Review and start run</h2>
                <br></br>
                <div>Review your run below. Look good? Confirm to start your run. Interested in unlimited, unmetered testing?</div>
                <br></br>
                <button onClick={this.handleRunTest.bind(this)}>Confirm and start run</button>
            </div>
        )
    }
}

export default AppStart;