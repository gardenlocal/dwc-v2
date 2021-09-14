exports.randomInRange = (a, b) => {
  return Math.random() * (b - a) + a
}

exports.randomIntInRange = (a, b) => { 
  return Math.floor(exports.randomInRange(a, b))
}