import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './testrunner.css';

class ListRuns extends Component {
    constructor(props) {
        super(props);
        this.state = {
            runs: [],
            pendingStatus: false
        }
    }

    componentDidMount() {
        axios.get('/aws-testrunner/listruns')
            .then(res => {
                if (res.data.runs[0].status !== 'COMPLETED') {
                    this.setState({ pendingStatus: true });
                } else {
                    this.setState({ pendingStatus: false })
                }
                this.setState({ runs: res.data });
            }).catch((err) => {
                console.log(err);
            });
    }

    renderRuns() {
        let buttonRender = <button type="button" class="btn btn-lg btn-primary" enabled>View</button>;
        if (this.state.pendingStatus) {
            buttonRender = <button type="button" class="btn btn-lg btn-primary" disabled>View</button>;
        }
        return Object.keys(this.state.runs).map((i, index) => {
            return (
                <div key={index}>
                    <table id="runs">
                        <tr>
                            <th>Run</th>
                            <th>Type</th>
                            <th>Platform</th>
                            <th>Status</th>
                            <th>Result</th>
                            <th>Created</th>
                            <th>View Run</th>
                        </tr>
                        {this.state.runs[i].map((run, index2) =>
                            <tr key={index2} data-value={run.arn}>
                                <td>{run.name} </td>
                                <td>{run.type}  </td>
                                <td>{run.platform}  </td>
                                <td>{run.status}  </td>
                                <td>{run.result}  </td>
                                <td>{run.created}  </td>
                                <td>
                                    <Link to={"/run/" + run.arn}>
                                        {buttonRender}
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </table>
                </div>
            )
        });
    }

    render() {
        return (
            <div>
                {this.renderRuns()}
            </div>
        )
    }
}

export default ListRuns;