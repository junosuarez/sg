var Id = require('./id')
var Galaxy = require('./galaxy')
var _ = {
  random: require('./randomMember')
}
var Geo = require('./geometry')

module.exports = Player;

var colors = {
  red: '#ED7474'
 , blue: '#6E94FF'
 , green: '#87D690'
 , orange: '#F5BA53'
}





function Player() {
  if (!(this instanceof Player)) {
    return new Player()
  }

  this.id = Id()
  this.location = Galaxy.Coord()
  this.velocity = {r: 0, a: 0}
  this.heading = 0
  this.power = 999
  this.orbitalPeriod = _.random.int(100, 400)
  this.color = colors[_.random(Object.keys(colors))]
}

Player.prototype.toggleShields = function () {
  if (this.power > 333) {
    this.shieldsUp = !this.shieldsUp
  }

  // when taking damage, if shields are up, damage is reduced by 60%
  // shields cost a certain amount of power over time
  // shields also limit maneuverability and sensor readings
  // and you cant beam things when shields are up
}

Player.prototype.orbit = function (target) {
  if (!target || !target.orbitable) {
    console.log('can\'t orbit ', target)
    return;
  }
  if (Geo.polarDistance(this.location, target.location) > 10000) {
    console.log('too far')
    return
  }

  console.log('orbiting ', target)
  target.owner = this
  this.location = target.location
  this.oribitalPeriod = target.orbitalPeriod
}