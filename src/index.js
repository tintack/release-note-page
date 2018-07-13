import React from "react"; // eslint-disable-line no-unused-vars
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Release from "./Release.js";

const Home = () => (
  <div>
    <h2>Home</h2>

    <Link to="/release/grpc/grpc-go/v1.14">Release</Link>
  </div>
);

function App() {
  return (
    <Router>
      <div>
        <CssBaseline />
        <Route exact path="/" component={Home} />
        <Route path="/release/:org?/:repo?/:version?" component={Release} />
      </div>
    </Router>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
