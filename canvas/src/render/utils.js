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
  