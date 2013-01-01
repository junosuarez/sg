var Id = require('./id')
var Galaxy = require('./galaxy')

var _ = {
  random: require('./randomMember')
}

var phonemes = [
  'ma',
  'me',
  'rya',
  'lo',
  'la',
  'ke',
  'rah',
  'tun',
  'ta',
  'voo',
  'per',
  'su',
  'cre'
]

function randomName() {
  var name = _.random.choose(phonemes, _.random.int(2, 4)).join('')
  name = name.charAt(0).toUpperCase() + name.substr(1)
  return name
}



module.exports = Planet

function Planet() {
  if (!(this instanceof Planet)) {
    return new Planet()
  }

  this.id = Id()
  this.name = randomName()
  this.location = Galaxy.Coord()
  this.size = _.random([2,3,3,3,3,4,4])
  this.orbitalPeriod = _.random.int(100, 400) // ticks
  this.owner = null


  this.technologyLevel = _.random.int(1, 10)
  this.energy = _.random.int(1, 10) * this.size
  this.habitability = _.random.int(1, 10)
  this.population = _.random.int(20,100) * this.size

  this.alignment = {
    self: _.random.int(80, 100)
  }
}

Planet.prototype.orbitable = true