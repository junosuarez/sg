var keys = {
  right: 37
 , up: 38
 , left: 39
 , down: 40
 , s: 83
 , o: 79
 , l: 76
}


module.exports = function(game) {


  function handleKey(code) {


    if (code === keys.s) {
      game.me.toggleShields()
    }

    else if (code === keys.left) {
      game.me.heading += .3
    }

    else if (code === keys.right) {
      game.me.heading -= .3
    }

    else if (code === keys.o) {
      game.me.orbit(game.target)
    }

    else if (code === keys.l) {
      game.opts.showLabels = !game.opts.showLabels
    }






  }



  return {
    handleKey: handleKey
  }



}