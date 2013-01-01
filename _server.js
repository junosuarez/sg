module.exports = Server

var EE = require('events').EventEmitter
var http = require('http')

function Server() {
  if (!(this instanceof Server)) {
    return new Server()
  }

  var emitter = new EE()

  this.listen = function (port) {


    

    
    emitter.emit('log', 'info', 'listening on ' + port)
  }

  this.on = emitter.on.bind(emitter)

}