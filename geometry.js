function sq(val) {
  return val * val
}

module.exports.polarToCart = function (polar) {
  return {
    x: Math.cos(polar.a) * polar.r
  , y: Math.sin(polar.a) * polar.r
  }
}

module.exports.cartToPolar = function(cart) {
  return {
    r: Math.sqrt(sq(cart.x) + sq(cart.y))
  , a: Math.atan2(cart.y, cart.x)
  }
}


module.exports.scale = function (min1, max1, min2, max2) {
  var scale1 = max1 - min1
  var scale2 = max2 - min2
  var factor = scale2 / scale1

  return function (val) {
    var val1 = val - min1
    var val2 = val1 * factor + min2
    return val2
  }
}

module.exports.translate = function (tX, tY) {
  return function (point) {
    return {
      x: point.x + tX,
      y: point.y + tY
    }
  }
}

module.exports.originate = function(point, origin) {
  return {
    x: point.x + origin.x,
    y: point.y + origin.y
  }
}


module.exports.point = function (x, y) {
  return {
    x: x
  , y: y
  }
}

module.exports.polarPoint = function (r, a) {
  return {
    r: r
  , a: a
  }
}

module.exports.distance = function (point1, point2) {
  return Math.sqrt(sq(point2.x - point1.x) + sq(point2.y - point1.y))
}

module.exports.polarDistance = function (polar1, polar2) {
  return Math.sqrt(sq(polar1.r) + sq(polar2.r) - (2 * polar1.r * polar2.r * Math.cos(polar1.a - polar2.a)))
}

module.exports.polarOriginate = function(polar1, polarOrigin) {
  return {
    r: polarOrigin.r + polar1.r
  , a: polarOrigin.a
  }
}