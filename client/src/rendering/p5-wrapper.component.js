import React from 'react'
import p5 from 'p5'
import { main } from './main'
import { mainAdmin, updateGlobalData } from './mainAdmin'

export default class P5Wrapper extends React.Component {
  processUsers = (allUsers, onlineUsers) => {
    if (!allUsers || !onlineUsers) return {}
    const onlineUsersMap = onlineUsers.reduce((acc, el) => {
      acc[el._id] = el
      return acc
    }, {})
    const users = allUsers.reduce((acc, el) => {
      acc[el._id] = {
        online: !!onlineUsersMap[el._id],
        data: el
      }

      return acc
    }, {})

    return users
  }
  componentDidMount() {
    const { type, data } = this.props
    if (type == 'user') {
      this._p5 = new p5(main, this._ref)
    } else if (type == 'admin') {
      this._p5 = new p5(mainAdmin, this._ref)
    }

    const { allUsers, onlineUsers } = this.props
    const users = this.processUsers(allUsers, onlineUsers)
    updateGlobalData({ users })
  }
  componentDidUpdate(oldProps, oldState) {
    const { allUsers, onlineUsers } = this.props
    const users = this.processUsers(allUsers, onlineUsers)
    updateGlobalData({ users })
  }
  render() {
    return (
      <div id="p5-container" ref={(r => this._ref = r)}>

      </div>
    )
  }
}