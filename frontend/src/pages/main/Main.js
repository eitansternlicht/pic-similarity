import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import App from '../app/App';
import Home from '../home/Home';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React from 'react';
import Survey from '../survey/Survey';
import SurveyResults from '../survey-results/SurveyResults';

const Main = () => {
    return (
        <Router>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="/">
                    <h1>PicSimilarity</h1>
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/app">App</Nav.Link>
                    <Nav.Link href="/survey">Survey</Nav.Link>
                    <Nav.Link href="/survey-results">Survey Results</Nav.Link>
                </Nav>
            </Navbar>
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
        </Router>
    );
};

export default Main;

// const Main = () => (
//     <Router>
//         <div>
//             <nav>
//                 <ul>
//                     <li>
//                         <Link to="/">Home</Link>
//                     </li>
//                     <li>
//                         <Link to="/app">App</Link>
//                     </li>
//                     <li>
//                         <Link to="/survey">Survey</Link>
//                     </li>
//                     <li>
//                         <Link to="/survey-results">SurveyResults</Link>
//                     </li>
//                 </ul>
//             </nav>
//             <Switch>
//                 <Route path="/app">
//                     <App />
//                 </Route>
//                 <Route path="/survey">
//                     <Survey />
//                 </Route>
//                 <Route path="/survey-results">
//                     <SurveyResults />
//                 </Route>
//                 <Route path="/">
//                     <Home />
//                 </Route>
//             </Switch>
//         </div>
//     </Router>
// );

// export default Main;
