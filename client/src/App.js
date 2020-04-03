import React from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import VerticalTabs from "./components/TestRunner/VerticalTabs";

function App() {
  return (
    <Router>
    <div className="App">
      <div>
        <Route path="/testrunner" component={VerticalTabs} />
      </div>
    </div>
    </Router>
  );
}

export default App;
