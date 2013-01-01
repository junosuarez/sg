module.exports.hexToRGBA = function(hex, alpha) {
  var r = parseInt(hex.substr(1,2), 16)
  var g = parseInt(hex.substr(3,2), 16)
  var b = parseInt(hex.substr(5,2), 16)
  return "rgba(" + [r,g,b,alpha].join() + ')'
}