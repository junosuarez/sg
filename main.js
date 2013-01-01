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
var Console = require('./console')

var raf = require('raf')


var emitter = new (require('events').EventEmitter)
process.emit = emitter.emit
process.on = emitter.on


var screenCanvas = document.createElement('canvas')
var size;
getSize()
screenCanvas.width = size.x
screenCanvas.height = size.y

var body = document.getElementsByTagName('body')[0]

body.appendChild(screenCanvas)


body.appendChild(Console.init())

Console('Welcome to SPACE GAEM')
setTimeout(function () {
  if ('ontouchend' in window) {
    Console('Tap to target, Doubletap to orbit. Engage!')
  } else {
    Console('Mouse to aim, T to target, O to orbit. Engage!')
  }
  //Console('press ? for controls')
}, 2000)

var screen = screenCanvas.getContext('2d')



//// generate map
// build some planets

var planets = _.random.range(0,7).map(Planet)

// console.log(planets)

// make a player
var me = Player()
me.homePlanet = _.random(planets)
me.homePlanet.owner = me
me.homePlanet.alignment[me.id] = 100
me.location = me.homePlanet.location
me.orbit(me.homePlanet)

// set up galaxy
var galaxy = Galaxy()
galaxy.planets = planets

var simTick = true

var game = {
  galaxy: galaxy,
  me: me,
  target: me.homePlanet,
  opts: {},
  togglePause: function () {
    if (simTick) {
      clearInterval(simTick)
      simTick = null
      Console('Paused!')
    } else {
      simTick = setInterval(sim, 250)
      Console('Resumed!')
    }
  }
}



var render = Renderer(screen, size, game)
var controls = Controls(game, render)

var renderClock = raf(screen)

renderClock.on('data', function () {
  render()
  //renderClock.pause()
})

var sim = Simulation(game)

simTick = setInterval(sim, 50)




function getSize() {
  size = {
    x: window.innerWidth
  , y: window.innerHeight
  }
}

window.addEventListener('resize', getSize, false)



window.addEventListener('touchmove', function (e) {
  e.preventDefault()
})

window.addEventListener('keydown', function (e) {
  // console.log(e.keyCode, e)
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


process.on('captured', function () {
  var remaining = game.galaxy.planets.filter(function (planet) {
    return planet.owner !== game.me
  })
  if (remaining.length < 3 && remaining.length > 0) {
    var one = remaining.length === 1;
    Console(remaining.length + ' planet' + (one ? '' : 's') + ' remain' + (one ? 's' : '') + '!')
  }
  else if (remaining.length === 0) {
    game.togglePause()
    Console.clear()
    Console.freeze('Flawless victory!')
  }
})
