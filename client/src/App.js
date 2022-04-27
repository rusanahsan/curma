import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import pages
import Home from "./pages/Home";
import Logreg from "./pages/Logreg"
import About from "./pages/About";
import Error from "./pages/Error";
import AllReviews from "./pages/AllReviews";
import MyReviews from "./pages/MyReviews";
import Statistics from "./pages/Statistics"
import Graph1 from "./pages/Graph1"
import Graph2 from "./pages/Graph2"
import Graph3 from "./pages/Graph3"
import Graph4 from "./pages/Graph4"
import SubGraph1 from "./pages/Subgraph1"
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/loginOrRegister">
          <Logreg/>
        </Route>
        <Route path="/allReviews">
          <AllReviews/>
        </Route>
        <Route path="/myReviews">
          <MyReviews/>
        </Route>
        <Route path="/about">
          <About/>
        </Route>
        <Route path="/statistics">
          <Statistics/>
        </Route>
        <Route path="/graph1">
          <Graph1/>
        </Route>
        <Route path="/graph2">
          <Graph2/>
        </Route>
        <Route path="/graph3">
          <Graph3/>
        </Route>
        <Route path="/graph4">
          <Graph4/>
        </Route>
        <Route path="/subgraph1">
          <SubGraph1/>
        </Route>
        <Route path="*">
          <Error />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
