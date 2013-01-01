var _ = {
  random: require('./randomMember')
}
var Player = require('./player')
var Planet = require('./planet')
var Renderer = require('./renderer')
var Galaxy = require('./galaxy')
var Touch = require('./touch')
var Simulation = require('./simulation')
var Controls = require('./controls')

var raf = require('raf')


var screenCanvas = document.createElement('canvas')
var size;
getSize()
screenCanvas.width = size.x
screenCanvas.height = size.y

var body = document.getElementsByTagName('body')[0]

body.appendChild(screenCanvas)

var screen = screenCanvas.getContext('2d')



//// generate map
// build some planets

var planets = _.random.range(0,9).map(Planet)

console.log(planets)

// make a player
var me = Player()
me.homePlanet = _.random(planets)
me.homePlanet.owner = me


// set up galaxy
var galaxy = Galaxy()
galaxy.planets = planets


var game = {
  galaxy: galaxy,
  me: me,
  target: me.homePlanet,
  opts: {}
}

var controls = Controls(game)


var render = Renderer(screen, size, game)

var renderClock = raf(screen)

renderClock.on('data', function () {
  render()
  //renderClock.pause()
})

setInterval(Simulation(game), 250)




function getSize() {
  size = {
    x: window.innerWidth
  , y: window.innerHeight
  }
}

window.addEventListener('resize', getSize, false)

window.addEventListener('touchend', function (e) {

  Touch.targeted(e.changedTouches[0], render.targets, function (target) {
    game.target = target.model
  })

}, false)

window.addEventListener('keydown', function (e) {
  console.log(e.keyCode)
  controls.handleKey(e.keyCode)
  if (!e.metaKey) {
    e.preventDefault()
  }
}, false)






window.debug = {
  planets: function (name) {
    return game.galaxy.planets.filter(function (planet) {
      return planet.name.toLowerCase() === name.toLowerCase()
    })[0]
  },
  me: game.me,
  game: game
}

