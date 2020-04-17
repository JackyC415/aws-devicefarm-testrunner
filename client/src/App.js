import React from 'react';
import CreateRun from "./components/TestRunner/CreateRun";
import GetRun from './components/TestRunner/GetRun';
import { Route, BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <div>
          <Route path="/createrun" component={CreateRun} />
          <Route path="/run/:id/:id2" component={GetRun} />
        </div>
      </div>
    </Router>
  );
}

export default App;
