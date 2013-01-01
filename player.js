var Id = require('./id')
var Galaxy = require('./galaxy')
var _ = {
  random: require('./randomMember')
}
var Geo = require('./geometry')
var Console = require('./console')

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
    Console('Can\'t orbit target')
    return;
  }
  var myLoc = this.orbiting ? this.orbiting.location : this.location
  if (Geo.polarDistance(myLoc, target.location) > 5000) {
    Console(target.name + 'is too far to orbit')
    return;
  }

  if (this.orbiting) {
    this.orbiting.orbitedBy = null
  }
  this.orbiting = target
  this.orbiting.orbitedBy = this

  Console('Orbiting ' + target.name)
  //this.capture(target)
  var radius = (target.size * 300 + 100)
  this.location = Geo.polarOriginate({r: radius}, target.location)
  this.orbitalPeriod = target.orbitalPeriod
}

Player.prototype.capture = function (target) {
  if (!target || !target.isPlanet) {
    Console('Can\'t capture target')
    return;
  }
  target.owner = this;
  Console('Captured ' + target.name)
  process.emit('captured', this, target)
}