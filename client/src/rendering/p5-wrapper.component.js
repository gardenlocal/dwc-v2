import React from 'react'
import p5 from 'p5'
import { main } from './main'
import { mainAdmin } from './mainAdmin'

export default class P5Wrapper extends React.Component {
  componentDidMount() {
    const { type, data } = this.props
    if (type == 'user') {
      this._p5 = new p5(main, this._ref)
    } else if (type == 'admin') {
      this._p5 = new p5(mainAdmin(data), this._ref)
    }
  }
  render() {
    return (
      <div id="p5-container" ref={(r => this._ref = r)}>

      </div>
    )
  }
}