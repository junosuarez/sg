var Geo = require('./geometry')
var Console = require('./console')

module.exports = function (game) {

  function tick() {

  movePlanets(game.galaxy.planets)

  movePlayer(game.me)

  doOrbiting(game.me)

  powerBudget(game.me)

  //console.log(game.me.power, game.me.color)
///  var distToTarget = game.target ? Geo.polarDistance(game.me.location, game.target.location) | 0 : null
 // console.log('target dist', distToTarget)
}

  return tick;
}

function movePlanets(planets) {
  planets.forEach(function (planet) {
    var eccentricity = Geo.polarToCart(planet.eccentricity)
    var negE = {x: -eccentricity.x, y: -eccentricity.y}
    var cart = Geo.polarToCart(planet.location)
    cart = Geo.originate(cart, negE)
    var loc = Geo.cartToPolar(cart)
    loc.a += 2 * Math.PI / planet.orbitalPeriod / 2
    cart = Geo.polarToCart(loc)
    cart = Geo.originate(cart, eccentricity)

    planet.location = Geo.cartToPolar(cart)
  })
}


function movePlayer(player) {

  player.location.a += 2 * Math.PI / player.orbitalPeriod / 2


  //player.heading += .5



}

var CAPTURE_RATE = 5

function doOrbiting(player) {
  if (player.orbiting) {
    var planet = player.orbiting

    if(planet.owner !== player) {
      player.power -= 30
      // console.log('capturing')

      if (planet.alignment[planet.owner.id] > CAPTURE_RATE) {
        planet.alignment[planet.owner.id] -= CAPTURE_RATE
      } else {
        planet.alignment[planet.owner.id] = 0
        player.capture(planet)
      }
    } else {
      if (!planet.alignment[player.id]) {
        planet.alignment[player.id] = 0
      }
      if (planet.alignment[player.id] < 100) {
        planet.alignment[player.id] += CAPTURE_RATE
      }

    }


  }
}

function powerBudget(player) {

  player.power += 6

  if (player.shieldsUp) {
    player.power -= 30

    if (player.power < 333) {
      player.shieldsUp = false
    }
  }

  if (player.power > 999) {
    player.power = 999
  }

  // console.log(player.power)
  if (player.power < 0) {
    game.togglePause()
    Console.clear()
    Console.freeze('game over dude')
  }

}