var randomMember = module.exports = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

module.exports.choose = function (arr, num) {
  var chosen = []
  while (chosen.length < num) {
    chosen.push(randomMember(arr))
  }
  return chosen;
}

module.exports.int = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports.range = function (min, max) {
  var x = []
  for (var i = min; i <= max; i++) {
    x.push(i)
  }
  return x;
}