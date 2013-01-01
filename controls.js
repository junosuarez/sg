var Touch = require('./touch')
var Geo = require('./geometry')

var mouse = {x:0, y: 0}

window.addEventListener('mousemove', function (e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

var keys = {
  right: 37
 , up: 38
 , left: 39
 , down: 40
 , s: 83
 , t: 84
 , o: 79
 , l: 76
 , question: 191
 , esc: 27
}


module.exports = function(game, renderer) {


  function handleKey(code) {


    if (code === keys.t) {

        game.target = getTarget(mouse)

    }

    if (code === keys.s) {
      game.me.toggleShields()
    }

    else if (code === keys.left) {
      game.me.heading += .3
    }

    else if (code === keys.right) {
      game.me.heading -= .3
    }

    else if (code === keys.o) {
      game.me.orbit(game.target)
    }

    else if (code === keys.l) {
      game.opts.showLabels = !game.opts.showLabels
    }

    else if (code === keys.question) {

    }

    else if (code === keys.esc) {
      game.togglePause()
    }

  }


  Touch.on('touchend', function (e) {
    var touch = e.changedTouches[0]
    var point = Geo.point(touch.clientX, touch.clientY)

    game.target = getTarget(e)
  })


  Touch.on('doubletap', function (e) {
    var target = getTarget(e)
    if (target && target.isPlanet) {
      game.me.orbit(target)
    }
  })


  function getTarget(point) {

    var target = renderer.getTarget(point)
    return target
  }


  return {
    handleKey: handleKey
  }




}