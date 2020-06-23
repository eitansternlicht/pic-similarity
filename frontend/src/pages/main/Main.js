import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import App from '../app/App';
import Home from '../home/Home';
import React from 'react';
import Survey from '../survey/Survey';
import SurveyResults from '../survey-results/SurveyResults';

const Main = () => (
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
                    <li>
                        <Link to="/survey-results">SurveyResults</Link>
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
                <Route path="/survey-results">
                    <SurveyResults />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </div>
    </Router>
);

export default Main;
