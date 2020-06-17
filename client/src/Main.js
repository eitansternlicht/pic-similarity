import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { App } from "./App";
import { Home } from "./Home";
import { Survey } from "./Survey";

export const Main = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/app">App</Link>
          </li>
          <li>
            <Link to="/survey">Survey</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/app">
          <App />
        </Route>
        <Route path="/survey">
          <Survey />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  </Router>
);

export default Main;
