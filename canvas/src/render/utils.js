export function map(n, start1, stop1, start2, stop2) {
  const newVal = (n - start1) / (stop1-start1) * (stop2 - start2) + start2;
  if(start2 < stop2) {
    return constrain(newVal, start2, stop2)
  } else {
    return constrain(newVal, stop2, start2)
  }
  return newVal;
}

export function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low)
}

export function Vector(mag, angle) {
  const angleRad = (angle * Math.PI) / 180;
  this.magX = mag * Math.cos(angleRad);
  this.magY = mag * Math.sin(angleRad);
}

export function distanceAndAngleBetweenTwoPoints(x1, y1, x2, y2) {
  var x = x2 - x1,
    y = y2 - y1;

  return {
    // x^2 + y^2 = r^2
    distance: Math.sqrt(x * x + y * y),

    // convert from radians to degrees
    angle: Math.atan2(y, x) * 180 / Math.PI
  }
}

export function randomInRange(a, b) {
  return Math.random() * (b - a) + a
}

export function randomIntInRange(a, b) { 
  return Math.floor(randomInRange(a, b))
}  

export function randomElementFromArray(arr) {
  return arr[randomIntInRange(0, arr.length)]
}

export function easeOutBounce(x) {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (x < 1 / d1) {
      return n1 * x * x;
  } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

export function easeInOutBounce(x) {
  return x < 0.5
    ? (1 - easeOutBounce(1 - 2 * x)) / 2
    : (1 + easeOutBounce(2 * x - 1)) / 2;  
}

export function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;  
}

export function lerp(x, y, alpha) {
  return x + (y - x) * alpha
}

export function lerpPoint(p1, p2, alpha) {
  return {
    x: lerp(p1.x, p2.x, alpha),
    y: lerp(p1.y, p2.y, alpha)
  }
}

export function sleep(s) {
  return new Promise((res, rej) => {
    setTimeout(() => res(), s)
  })
}
  
