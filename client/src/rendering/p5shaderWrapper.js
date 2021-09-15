import React from 'react';
import p5 from 'p5';
import { sketch } from './p5shader/metaballSketch.js';
// import { sketch } from './p5shader/sketch.js';

export default class Wrapper extends React.Component {
  componentDidMount() {
    this._p5 = new p5(sketch, this._ref)
  }

  componentDidUpdate(oldProps, oldState) {
  }

  render() {
    return (
      <div id="p5-container" ref={(r => this._ref = r)}>

      </div>
    )
  }
}