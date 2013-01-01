module.exports = galaxy

var GALACTIC_RADIUS = module.exports.GALACTIC_RADIUS = 10000 // light years



function galaxy () {
  return {
    planets: []
  }
}




module.exports.Coord = function () {
  // galactic coordinates are polar coordinates
  // eg, a vector of a rho in radians 0..2pi and a magnitude distance from the origin (galactic central black hole)
  // note that the rho is the initial starting position.
  // as the simulation progresses, rhos increment for orbit (everything just orbits around the blackhole) and the magnitude gradually (and acceleratingly) decreases, indicating a degrading orbit as the planets get sucked in to their ultimate demise

  // r: radius
  // a: azimuth

  return {
    r: (Math.random() * (GALACTIC_RADIUS * .8)) + GALACTIC_RADIUS * .2,
    a: Math.random() * 2 * Math.PI
  }

}