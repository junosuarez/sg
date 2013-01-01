module.exports = Console
var el;
module.exports.init = function () {
  el = document.createElement('div')
  el.id = 'console'
  return el
}


function Console(message) {

  var msgEl = document.createElement('div')
  el.appendChild(msgEl)
  if (el.childNodes.length > 5) {
    el.removeChild(el.childNodes[0])
  }

  msgEl.innerText = message

  setTimeout(function () {
    el.removeChild(msgEl)
  }, 3000)
}

Console.clear = function () {
  el.innerHTML = ''
}

Console.freeze = function (message) {
  var msgEl = document.createElement('div')
  el.appendChild(msgEl)
  if (el.childNodes.length > 5) {
    el.removeChild(el.childNodes[0])
  }

  msgEl.innerText = message

}