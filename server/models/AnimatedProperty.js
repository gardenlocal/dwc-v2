module.exports = class AnimatableProperty {
  constructor(type, from, teleport, to, duration, isEnabled = true, startTime = new Date().getTime()) {
    this.type = type
    this.from = from
    this.teleport = teleport
    this.to = to
    this.duration = duration
    this.isEnabled = isEnabled
    this.startTime = startTime
  }
}