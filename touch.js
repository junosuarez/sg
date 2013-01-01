var Geo = require('./geometry')

module.exports.targeted = function (touch, possibleTargets, cb) {
  var point = Geo.point(touch.clientX, touch.clientY)

  for (var i = 0; i < possibleTargets.length; i++){
    var target = possibleTargets[i]
    if (Geo.distance(point, target.point) < (target.size + 10)) {
      cb(target)
      break
    }
  }

}