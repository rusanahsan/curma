import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import pages
import Home from "./pages/Home";
import Logreg from "./pages/Logreg"
import About from "./pages/About";
import Error from "./pages/Error";
import AllReviews from "./pages/AllReviews";
import MyReviews from "./pages/MyReviews";

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
        <Route path="*">
          <Error />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
