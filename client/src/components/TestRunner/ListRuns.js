import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './testrunner.css';

class ListRuns extends Component {
    constructor(props) {
        super(props);
        this.state = {
            runs: []
        }
        this.handleLink = this.handleLink.bind(this);
    }

    componentDidMount() {
        axios.get('/aws-testrunner/listruns')
            .then(res => {
                console.log(res.data);
                this.setState({ runs: res.data });
            }).catch((err) => {
                console.log(err);
            });
    }

    handleLink(e) {
        let runArn = e.currentTarget.getAttribute('data-value');
        console.log("run arn: " + runArn);
        //this.props.history.push('/test' + runArn);
    }

    renderRuns() {
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
                            <tr key={index2} data-value={run.arn} onClick={this.handleLink}>
                                <td>{run.name} </td>
                                <td>{run.type}  </td>
                                <td>{run.platform}  </td>
                                <td>{run.status}  </td>
                                <td>{run.result}  </td>
                                <td>{run.created}  </td>
                                <td> <Link to={"/run/" + run.arn}>View</Link> </td>
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