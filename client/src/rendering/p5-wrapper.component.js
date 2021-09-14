import React from 'react'
import p5 from 'p5'
import { main } from './main'
import { mainAdmin } from './mainAdmin'
import { updateGlobalData } from './globalData'

export default class P5Wrapper extends React.Component {
  componentDidMount() {
    const { type } = this.props
    if (type == 'user') {
      this._p5 = new p5(main, this._ref)
    } else if (type == 'admin') {
      this._p5 = new p5(mainAdmin, this._ref)
    }

    const { users, creatures, currentUser } = this.props    
    updateGlobalData({ users, creatures, currentUser })
  }

  componentDidUpdate(oldProps, oldState) {
    const { users, creatures, currentUser } = this.props    
    updateGlobalData({ users, creatures, currentUser })
  }

  render() {
    return (
      <div id="p5-container" ref={(r => this._ref = r)}>

      </div>
    )
  }
}