import React, { Component } from "react";
import { hot } from "react-hot-loader";
import "./App.css";

import Carousel from "./components/Carousel/Carousel";

import PanelOne from "./components/Panels/PanelOne"
import PanelTwo from "./components/Panels/PanelTwo"
import PanelThree from "./components/Panels/PanelThree"
import PanelFour from "./components/Panels/PanelFour"


class App extends Component {
  render() {

    return (
      <div className="App">
        <div className="container">
          <Carousel>
            < PanelOne />
            < PanelTwo />
            < PanelThree />
            < PanelFour />
          </Carousel>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);