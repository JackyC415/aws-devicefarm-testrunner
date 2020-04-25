import React, { Component } from 'react';
import axios from 'axios';
import CanvasJSReact from '../../assets/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class GetRun extends Component {
    constructor(props) {
        super(props);
        this.state = {
            run: [],
            pieChart: {}
        }
    }

    componentDidMount() {
        let arn = this.props.match.params.id + "/" + this.props.match.params.id2;
        axios.get('/aws-testrunner/getrun/' + arn)
            .then(res => {
                this.setState({ run: res.data });
                this.setState({ pieChart: { dataPoints: [{ y: 5, label: 'b' }] } });
            }).catch((err) => {
                console.log(err);
            });
    }

    renderRuns() {
        let totalMins = null;
        return Object.keys(this.state.run).map((i, index) => {
            if (this.state.run[i].deviceMinutes) {
                totalMins = <td>{this.state.run[i].deviceMinutes.total}</td>
            }
            this.state.pieChart = {
                theme: "dark2",
                animationEnabled: true,
                exportFileName: "Result",
                exportEnabled: true,
                title: {
                    text: "Test Result"
                },
                data: [{
                    type: "pie",
                    showInLegend: true,
                    legendText: "{label}",
                    toolTipContent: "{label}: <strong>{y} cases</strong>",
                    indexLabel: "{y}",
                    indexLabelPlacement: "inside",
                    dataPoints: []
                }]
            }

            let test = this.state.run[i].counters;
            if (test.failed !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.failed, label: 'FAILED' });
            }
            if (test.passed !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.passed, label: 'PASSED' });
            }
            if (test.skipped !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.skipped, label: 'SKIPPED' });
            }
            if (test.warned !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.warned, label: 'WARNED' });
            }
            if (test.stopped !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.stopped, label: 'STOPPED' });
            }
            if (test.errored !== 0) {
                this.state.pieChart.data[0].dataPoints.push({ y: test.errored, label: 'ERRORED' });
            }

            return (
                <div key={index}>
                    <table id="runs">
                        <tr>
                            <th>Run</th>
                            <th>Type</th>
                            <th>Platform</th>
                            <th>Status</th>
                            <th>Result</th>
                            <th>Total minutes</th>
                        </tr>
                        <tr>
                            <td>{this.state.run[i].name}</td>
                            <td>{this.state.run[i].type}</td>
                            <td>{this.state.run[i].platform}</td>
                            <td>{this.state.run[i].status}</td>
                            <td>{this.state.run[i].result}</td>
                            {totalMins}
                        </tr>
                    </table>
                </div>
            )
        });
    }

    render() {
        return (
            <div>
                {this.renderRuns()}
                <CanvasJSChart options={this.state.pieChart} />
            </div>
        )
    }
}

export default GetRun;