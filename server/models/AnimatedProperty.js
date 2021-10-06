module.exports = class AnimatableProperty {
  constructor(type, from, to, duration, isEnabled = true, startTime = new Date().getTime()) {
    this.type = type
    this.from = from
    this.to = to
    this.duration = duration
    this.isEnabled = isEnabled
    this.startTime = startTime
  }
}