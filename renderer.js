var Galaxy = require('./galaxy')
var Geo = require('./geometry')
var Color = require('./color')

module.exports = function (context, size, game) {

  var render = function () {
    render.targets = []

    context.clearRect(0,0,size.x,size.y)


    drawQuadrants()


    game.galaxy.planets.forEach(drawPlanet)

    drawMe(game.me)

    //console.log('yay')
  }

  render.getTarget = function (point) {
    for (var i = 0; i < render.targets.length; i++){
      var target = render.targets[i]
      if (Geo.distance(point, target.point) < (target.size + 10)) {

        return target.model
      }
    }
  }


  var s = Math.min(size.x, size.y) / 2

  var gScale = Geo.scale(0, Galaxy.GALACTIC_RADIUS, 0, s)
  var translateOrigin = Geo.translate(gScale(Galaxy.GALACTIC_RADIUS), gScale(Galaxy.GALACTIC_RADIUS))
  var plot = function (point) {
    var p = {
      x: gScale(point.x)
    , y: gScale(point.y)
    }

    return translateOrigin(p)

  }


  function drawMe(me) {
    var here = plot(Geo.polarToCart(me.location))

    context.beginPath()
    context.arc(here.x, here.y, 10, 0, 2 * Math.PI, false)
    context.fillStyle = me.color//'#eeeeee'
    context.fill()

    var lineEnd = Geo.originate(Geo.polarToCart({r: 25, a: me.heading}), here)
    context.beginPath()
    context.moveTo(here.x, here.y)
    context.lineTo(lineEnd.x, lineEnd.y)
    context.lineWidth = 5
    context.strokeStyle = me.color //'#eeeeee'
    context.stroke()


    if (me.shieldsUp) {
      context.beginPath()
      context.arc(here.x, here.y, 30, 0, 2 * Math.PI, false)
      context.lineWidth = 2
      context.fillStyle = 'rgba(44, 118, 245, 0.5)'
      context.strokeStyle = '#2C76F5'
      context.stroke()
      context.fill()
    }

  }

  function drawPlanet(planet) {
    var here = plot(Geo.polarToCart(planet.location))

    render.targets.push({
      model: planet
    , point: here
    , size: planet.size * 10
    })

    context.beginPath()
    context.arc(here.x, here.y, planet.size * 10, 0, 2 * Math.PI, false)

    if (planet === game.target) {
      context.lineWidth = 3
      context.strokeStyle = '#ffff66'
    } else {
      context.lineWidth = 2
      context.strokeStyle = 'rgba(255,255,255,.7)'
    }
    context.stroke()

    if (planet.owner) {
      context.fillStyle = planet.owner.color
      context.fill()
    }

    if (planet === game.target || game.opts.showLabels) {

      // orbit
      context.beginPath()
      //var speedPct = 1 - (planet.orbitalPeriod / planet.MAX_ORBITAL_PERIOD)
      //var tailLen = Math.PI / 2 * speedPct
      var tailLen = 2*Math.PI
      var orbitOrigin = plot(Geo.polarToCart(planet.eccentricity))
      context.arc(orbitOrigin.x, orbitOrigin.y, Geo.distance(here, orbitOrigin), 0, tailLen, false)
      context.lineWidth = 2
      context.strokeStyle = Color.hexToRGBA(planet.owner.color, .5)
      context.stroke()

      // label
      var label = planet.name
      //label = orbitOrigin.x + ' ' + orbitOrigin.y + ' ' + Geo.distance(here, orbitOrigin)
      context.font = '20px "Press Start 2p"';
      context.textAlign = 'center';
      context.fillStyle = '#ffff66';
      context.fillText(label, here.x, here.y - (planet.size * 10 + 10));


    }

    if (planet.orbitedBy) {

      var y = here.y + (planet.size * 10 + 10)
      var x = here.x - 49

      var width = planet.alignment[planet.owner.id]


      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + width, y)
      context.lineWidth = 4
      context.strokeStyle = planet.owner.color
      context.stroke()
    }

  }


  function drawQuadrants() {

    var mid = gScale(Galaxy.GALACTIC_RADIUS)

    drawLine(0, mid, size.x, mid, '#aaaaaa')
    drawLine(mid, 0, mid, size.y, '#aaaaaa')

  }

  function drawJoystick() {

  }

  function drawLine(x1, y1, x2, y2, style) {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.lineWidth = .5
    context.strokeStyle = style
    context.stroke()
  }





  return render
}