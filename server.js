var server = require('./_server')()

server.on('log', function () {
  console.log.apply(console.log, Array.prototype.slice.call(arguments))
})




server.listen(2013)