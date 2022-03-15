import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

import Dashboard from "views/Dashboard";
const routerBaseName = process.env.PUBLIC_URL;

ReactDOM.render(
  <BrowserRouter basename={routerBaseName}>
    <Switch>
      <Route path="/" exact component={Dashboard} />
      <Redirect from="*" to="/" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
