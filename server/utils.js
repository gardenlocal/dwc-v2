exports.randomInRange = (a, b) => {
  return Math.random() * (b - a) + a
}

exports.randomIntInRange = (a, b) => { 
  return Math.floor(exports.randomInRange(a, b))
}

exports.randomElementFromArray = (arr) => {
  return arr[exports.randomIntInRange(0, arr.length)]
}

exports.distance = (p1, p2) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}