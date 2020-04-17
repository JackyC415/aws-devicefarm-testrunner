import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pie, HorizontalBar } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";

class GetRun extends Component {
    constructor(props) {
        super(props);
        this.state = {
            run: [],
            dataPie: {
                labels: ["FAILED", "PASSED", "SKIPPED", "WARNED", "STOPPED"],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [
                            "#F7464A",
                            "#46BFBD",
                            "#FDB45C",
                            "#949FB1",
                            "#4D5360",
                            "#AC64AD"
                        ],
                        hoverBackgroundColor: [
                            "#FF5A5E",
                            "#5AD3D1",
                            "#FFC870",
                            "#A8B3C5",
                            "#616774",
                            "#DA92DB"
                        ]
                    }
                ]
            },
            dataHorizontal: {
                labels: ['Failed', 'Passed', 'Skipped', 'Warned', 'Stopped', 'Errored'],
                datasets: [
                    {
                        label: 'Test Result',
                        data: [],
                        fill: false,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)'
                        ],
                        borderWidth: 1
                    }
                ]
            }
        }
    }

    componentDidMount() {
        let arn = this.props.match.params.id + "/" + this.props.match.params.id2;
        axios.get('/aws-testrunner/getrun/' + arn)
            .then(res => {
                this.setState({ run: res.data });
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
            { this.state.dataPie.datasets[0].data[0] = this.state.run[i].counters.failed }
            { this.state.dataPie.datasets[0].data[1] = this.state.run[i].counters.passed }
            { this.state.dataPie.datasets[0].data[2] = this.state.run[i].counters.skipped }
            { this.state.dataPie.datasets[0].data[3] = this.state.run[i].counters.warned }
            { this.state.dataPie.datasets[0].data[4] = this.state.run[i].counters.stopped }

            { this.state.dataHorizontal.datasets[0].data[0] = this.state.run[i].counters.failed }
            { this.state.dataHorizontal.datasets[0].data[1] = this.state.run[i].counters.passed }
            { this.state.dataHorizontal.datasets[0].data[2] = this.state.run[i].counters.skipped }
            { this.state.dataHorizontal.datasets[0].data[3] = this.state.run[i].counters.warned }
            { this.state.dataHorizontal.datasets[0].data[4] = this.state.run[i].counters.stopped }
            { this.state.dataHorizontal.datasets[0].data[5] = this.state.run[i].counters.errored }

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
                <MDBContainer>
                    <Pie data={this.state.dataPie} options={{ responsive: true }} />
                </MDBContainer>

                <MDBContainer>
                    <HorizontalBar
                        data={this.state.dataHorizontal}
                        options={{ responsive: true }}
                    />
                </MDBContainer>
            </div>
        )
    }
}

export default GetRun;