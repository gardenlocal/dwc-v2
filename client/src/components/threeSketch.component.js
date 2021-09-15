import React, { Component } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { SampleThree } from "../rendering/threejs/index";

class ThreeSketch extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {

    
  }

  render() {
    return (
      <div className="garden-container" id="three-sketch">
        <header className="jumbotron">
        </header>
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <directionalLight color="red" position={[0, 0, 5]}  />
            <SampleThree />
          </Suspense>
        </Canvas>
      </div>
    );
  }
}

export default ThreeSketch;
