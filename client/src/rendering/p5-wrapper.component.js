import React from 'react'
import p5 from 'p5'
import { main } from './main'

export default class P5Wrapper extends React.Component {
  componentDidMount() {
    this._p5 = new p5(main, this._ref)
  }
  render() {
    return (
      <div id="p5-container" ref={(r => this._ref = r)}>

      </div>
    )
  }
}