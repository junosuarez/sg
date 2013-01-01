var Geo = require('./geometry')

window.addEventListener('touchend', touchend, false)

var emitter = new (require('events').EventEmitter)


module.exports = emitter


var touches = []
function touchend (touch) {
  emitter.emit('touchend', touch)

  var changed = touch.changedTouches[0]
  var changedPoint = Geo.point(changed.clientX, changed.clientY)

  garbageCollectTouches()

  var existing = touches.filter(function (touch) {
    var t = touch.changedTouches[0]
    return Geo.distance(Geo.point(t.clientX, t.clientY), changedPoint) < 30
  })[0]

  if (existing) {
    emitter.emit('doubletap', touch)
    console.log('doubletap')
  }

  touches.push(touch)

  touch.preventDefault()
}

function garbageCollectTouches () {
  var now = Date.now()
  touches = touches.filter(function (touch) {
    return now - touch.timeStamp < 300
  })
}

//emitter.on('touchEnd', targeted)