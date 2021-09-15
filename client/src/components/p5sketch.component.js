import React, { Component } from "react";
import Wrapper from "../rendering/p5shaderWrapper.js"

class P5Sketch extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {

    // create new canvas
    if(document.getElementsByClassName('p5Canvas').length === 1) {
      let canvas = document.getElementsByClassName('p5Canvas')[0];
      canvas.style.transform = `scale(${window.innerHeight / 1000}) translateX(0) translateY(0)`
      canvas.style.position = 'absolute'
      // canvas.style.left = '50%'
      canvas.style.top = '0'
    }
  }

  render() {
    return (
      <div className="garden-container">
        <header className="jumbotron">
        </header>
        <Wrapper />
      </div>
    );
  }
}

export default P5Sketch;
