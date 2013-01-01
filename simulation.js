var Geo = require('./geometry')
module.exports = function (game) {

  function tick() {

  orbitPlanets(game.galaxy.planets)

  movePlayer(game.me)

  powerBudget(game.me)

  console.log(game.me.power, game.me.color)
  var distToTarget = game.target ? Geo.polarDistance(game.me.location, game.target.location) | 0 : null
  console.log('target dist', distToTarget)
}

  return tick;
}

function orbitPlanets(planets) {
  planets.forEach(function (planet) {
    planet.location.a += 2 * Math.PI / planet.orbitalPeriod
  })
}


function movePlayer(player) {

  player.location.a += 2 * Math.PI / player.orbitalPeriod


  //player.heading += .5



}


function powerBudget(player) {

  player.power += 10

  if (player.shieldsUp) {
    player.power -= 30

    if (player.power < 333) {
      player.shieldsUp = false
    }
  }

  if (player.power > 999) {
    player.power = 999
  }

}