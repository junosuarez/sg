(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",Function(['require','module','exports','__dirname','__filename','process','global'],"function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\n//@ sourceURL=path"
));

require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process','global'],"var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== 'undefined'\n        && window.setImmediate;\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n\n//@ sourceURL=__browserify_process"
));

require.define("/package.json",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = {\"main\":\"main.js\"}\n//@ sourceURL=/package.json"
));

require.define("/randomMember.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var randomMember = module.exports = function (arr) {\n  return arr[Math.floor(Math.random() * arr.length)]\n}\n\nmodule.exports.choose = function (arr, num) {\n  var chosen = []\n  while (chosen.length < num) {\n    chosen.push(randomMember(arr))\n  }\n  return chosen;\n}\n\nmodule.exports.int = function (min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min\n}\n\nmodule.exports.range = function (min, max) {\n  var x = []\n  for (var i = min; i <= max; i++) {\n    x.push(i)\n  }\n  return x;\n}\n//@ sourceURL=/randomMember.js"
));

require.define("/player.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Id = require('./id')\nvar Galaxy = require('./galaxy')\nvar _ = {\n  random: require('./randomMember')\n}\nvar Geo = require('./geometry')\nvar Console = require('./console')\n\nmodule.exports = Player;\n\nvar colors = {\n  red: '#ED7474'\n , blue: '#6E94FF'\n , green: '#87D690'\n , orange: '#F5BA53'\n}\n\n\n\n\n\nfunction Player() {\n  if (!(this instanceof Player)) {\n    return new Player()\n  }\n\n  this.id = Id()\n  this.location = Galaxy.Coord()\n  this.velocity = {r: 0, a: 0}\n  this.heading = 0\n  this.power = 999\n  this.orbitalPeriod = _.random.int(100, 400)\n  this.color = colors[_.random(Object.keys(colors))]\n}\n\nPlayer.prototype.toggleShields = function () {\n  if (this.power > 333) {\n    this.shieldsUp = !this.shieldsUp\n  }\n\n  // when taking damage, if shields are up, damage is reduced by 60%\n  // shields cost a certain amount of power over time\n  // shields also limit maneuverability and sensor readings\n  // and you cant beam things when shields are up\n}\n\nPlayer.prototype.orbit = function (target) {\n  if (!target || !target.orbitable) {\n    Console('Can\\'t orbit target')\n    return;\n  }\n  var myLoc = this.orbiting ? this.orbiting.location : this.location\n  if (Geo.polarDistance(myLoc, target.location) > 5000) {\n    Console(target.name + ' is too far to orbit')\n    return;\n  }\n\n  if (this.orbiting) {\n    this.orbiting.orbitedBy = null\n  }\n  this.orbiting = target\n  this.orbiting.orbitedBy = this\n\n  Console('Orbiting ' + target.name)\n  //this.capture(target)\n  var radius = (target.size * 300 + 100)\n  this.location = Geo.polarOriginate({r: radius}, target.location)\n  this.orbitalPeriod = target.orbitalPeriod\n}\n\nPlayer.prototype.capture = function (target) {\n  if (!target || !target.isPlanet) {\n    Console('Can\\'t capture target')\n    return;\n  }\n  target.owner = this;\n  Console('Captured ' + target.name)\n  process.emit('captured', this, target)\n}\n//@ sourceURL=/player.js"
));

require.define("/id.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var x = 1;\nmodule.exports = function () {\n  return x++\n}\n//@ sourceURL=/id.js"
));

require.define("/galaxy.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = galaxy\n\nvar GALACTIC_RADIUS = module.exports.GALACTIC_RADIUS = 10000 // light years\n\n\n\nfunction galaxy () {\n  return {\n    planets: []\n  }\n}\n\n\n\n\nmodule.exports.Coord = function () {\n  // galactic coordinates are polar coordinates\n  // eg, a vector of a rho in radians 0..2pi and a magnitude distance from the origin (galactic central black hole)\n  // note that the rho is the initial starting position.\n  // as the simulation progresses, rhos increment for orbit (everything just orbits around the blackhole) and the magnitude gradually (and acceleratingly) decreases, indicating a degrading orbit as the planets get sucked in to their ultimate demise\n\n  // r: radius\n  // a: azimuth\n\n  return {\n    r: (Math.random() * (GALACTIC_RADIUS * .8)) + GALACTIC_RADIUS * .2,\n    a: Math.random() * 2 * Math.PI\n  }\n\n}\n//@ sourceURL=/galaxy.js"
));

require.define("/geometry.js",Function(['require','module','exports','__dirname','__filename','process','global'],"function sq(val) {\n  return val * val\n}\n\nmodule.exports.polarToCart = function (polar) {\n  return {\n    x: Math.cos(polar.a) * polar.r\n  , y: Math.sin(polar.a) * polar.r\n  }\n}\n\nmodule.exports.cartToPolar = function(cart) {\n  return {\n    r: Math.sqrt(sq(cart.x) + sq(cart.y))\n  , a: Math.atan2(cart.y, cart.x)\n  }\n}\n\n\nmodule.exports.scale = function (min1, max1, min2, max2) {\n  var scale1 = max1 - min1\n  var scale2 = max2 - min2\n  var factor = scale2 / scale1\n\n  return function (val) {\n    var val1 = val - min1\n    var val2 = val1 * factor + min2\n    return val2\n  }\n}\n\nmodule.exports.translate = function (tX, tY) {\n  return function (point) {\n    return {\n      x: point.x + tX,\n      y: point.y + tY\n    }\n  }\n}\n\nmodule.exports.originate = function(point, origin) {\n  return {\n    x: point.x + origin.x,\n    y: point.y + origin.y\n  }\n}\n\n\nmodule.exports.point = function (x, y) {\n  return {\n    x: x\n  , y: y\n  }\n}\n\nmodule.exports.polarPoint = function (r, a) {\n  return {\n    r: r\n  , a: a\n  }\n}\n\nmodule.exports.distance = function (point1, point2) {\n  return Math.sqrt(sq(point2.x - point1.x) + sq(point2.y - point1.y))\n}\n\nmodule.exports.polarDistance = function (polar1, polar2) {\n  return Math.sqrt(sq(polar1.r) + sq(polar2.r) - (2 * polar1.r * polar2.r * Math.cos(polar1.a - polar2.a)))\n}\n\nmodule.exports.polarOriginate = function(polar1, polarOrigin) {\n  return {\n    r: polarOrigin.r + polar1.r\n  , a: polarOrigin.a\n  }\n}\n//@ sourceURL=/geometry.js"
));

require.define("/console.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = Console\nvar el;\nmodule.exports.init = function () {\n  el = document.createElement('div')\n  el.id = 'console'\n  return el\n}\n\n\nfunction Console(message) {\n\n  var msgEl = document.createElement('div')\n  el.appendChild(msgEl)\n  if (el.childNodes.length > 5) {\n    el.removeChild(el.childNodes[0])\n  }\n\n  msgEl.innerText = message\n\n  setTimeout(function () {\n    el.removeChild(msgEl)\n  }, 3000)\n}\n\nConsole.clear = function () {\n  el.innerHTML = ''\n}\n\nConsole.freeze = function (message) {\n  var msgEl = document.createElement('div')\n  el.appendChild(msgEl)\n  if (el.childNodes.length > 5) {\n    el.removeChild(el.childNodes[0])\n  }\n\n  msgEl.innerText = message\n\n}\n//@ sourceURL=/console.js"
));

require.define("/planet.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Id = require('./id')\nvar Galaxy = require('./galaxy')\nvar Geo = require('./geometry')\nvar _ = {\n  random: require('./randomMember')\n}\n\nvar phonemes = [\n  'ma',\n  'me',\n  'rya',\n  'lo',\n  'la',\n  'ke',\n  'rah',\n  'tun',\n  'ta',\n  'voo',\n  'per',\n  'su',\n  'cre'\n]\n\nfunction randomName() {\n  var name = _.random.choose(phonemes, _.random.int(2, 4)).join('')\n  name = name.charAt(0).toUpperCase() + name.substr(1)\n  return name\n}\n\n\n\nmodule.exports = Planet\n\nfunction Planet() {\n  if (!(this instanceof Planet)) {\n    return new Planet()\n  }\n\n  this.id = Id()\n  this.color = '#666666'\n  this.name = randomName()\n  this.location = Galaxy.Coord()\n  this.eccentricity = {\n    r: _.random.int(0, 99)\n  , a: Math.random() * 2 * Math.PI\n  }\n  this.size = _.random([2,3,3,3,3,4,4])\n  this.orbitalPeriod = _.random.int(100, 400) // ticks\n  this.owner = this\n\n\n  this.technologyLevel = _.random.int(1, 10)\n  this.energy = _.random.int(1, 10) * this.size\n  this.habitability = _.random.int(1, 10)\n  this.population = _.random.int(20,100) * this.size\n\n  this.alignment = {}\n  this.alignment[this.id] = _.random.int(80, 100)\n\n}\n\nPlanet.prototype.orbitable = true\nPlanet.prototype.isPlanet = true // TODO: refactor, cause wtf?\n//@ sourceURL=/planet.js"
));

require.define("/renderer.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Galaxy = require('./galaxy')\nvar Geo = require('./geometry')\n\nmodule.exports = function (context, size, game) {\n\n  var render = function () {\n    render.targets = []\n\n    context.clearRect(0,0,size.x,size.y)\n\n\n    drawQuadrants()\n\n\n    game.galaxy.planets.forEach(drawPlanet)\n\n    drawMe(game.me)\n\n    //console.log('yay')\n  }\n\n  render.getTarget = function (point) {\n    for (var i = 0; i < render.targets.length; i++){\n      var target = render.targets[i]\n      if (Geo.distance(point, target.point) < (target.size + 10)) {\n\n        return target.model\n      }\n    }\n  }\n\n\n  var s = Math.min(size.x, size.y) / 2\n\n  var gScale = Geo.scale(0, Galaxy.GALACTIC_RADIUS, 0, s)\n  var translateOrigin = Geo.translate(gScale(Galaxy.GALACTIC_RADIUS), gScale(Galaxy.GALACTIC_RADIUS))\n  var plot = function (point) {\n    var p = {\n      x: gScale(point.x)\n    , y: gScale(point.y)\n    }\n\n    return translateOrigin(p)\n\n  }\n\n\n  function drawMe(me) {\n    var here = plot(Geo.polarToCart(me.location))\n\n    context.beginPath()\n    context.arc(here.x, here.y, 10, 0, 2 * Math.PI, false)\n    context.fillStyle = me.color//'#eeeeee'\n    context.fill()\n\n    var lineEnd = Geo.originate(Geo.polarToCart({r: 25, a: me.heading}), here)\n    context.beginPath()\n    context.moveTo(here.x, here.y)\n    context.lineTo(lineEnd.x, lineEnd.y)\n    context.lineWidth = 5\n    context.strokeStyle = me.color //'#eeeeee'\n    context.stroke()\n\n\n    if (me.shieldsUp) {\n      context.beginPath()\n      context.arc(here.x, here.y, 30, 0, 2 * Math.PI, false)\n      context.lineWidth = 2\n      context.fillStyle = 'rgba(44, 118, 245, 0.5)'\n      context.strokeStyle = '#2C76F5'\n      context.stroke()\n      context.fill()\n    }\n\n  }\n\n  function drawPlanet(planet) {\n    var here = plot(Geo.polarToCart(planet.location))\n\n    render.targets.push({\n      model: planet\n    , point: here\n    , size: planet.size * 10\n    })\n\n    context.beginPath()\n    context.arc(here.x, here.y, planet.size * 10, 0, 2 * Math.PI, false)\n\n    if (planet === game.target) {\n      context.lineWidth = 3\n      context.strokeStyle = '#ffff66'\n    } else {\n      context.lineWidth = 2\n      context.strokeStyle = 'rgba(255,255,255,.7)'\n    }\n    context.stroke()\n\n    if (planet.owner) {\n      context.fillStyle = planet.owner.color\n      context.fill()\n    }\n\n    if (planet === game.target || game.opts.showLabels) {\n\n      // orbit\n      context.beginPath()\n      var orbitOrigin = plot(Geo.polarToCart(planet.eccentricity))\n      context.arc(orbitOrigin.x, orbitOrigin.y, Geo.distance(here, orbitOrigin), 0, 2*Math.PI, false)\n      context.lineWidth = 2\n      context.strokeStyle = planet.owner.color\n      context.stroke()\n\n      // label\n      var label = planet.name\n      label = orbitOrigin.x + ' ' + orbitOrigin.y + ' ' + Geo.distance(here, orbitOrigin)\n      context.font = '20px \"Press Start 2p\"';\n      context.textAlign = 'center';\n      context.fillStyle = '#ffff66';\n      context.fillText(label, here.x, here.y - (planet.size * 10 + 10));\n\n\n    }\n\n    if (planet.orbitedBy) {\n\n      var y = here.y + (planet.size * 10 + 10)\n      var x = here.x - 49\n\n      var width = planet.alignment[planet.owner.id]\n\n\n      context.beginPath()\n      context.moveTo(x, y)\n      context.lineTo(x + width, y)\n      context.lineWidth = 4\n      context.strokeStyle = planet.owner.color\n      context.stroke()\n    }\n\n  }\n\n\n  function drawQuadrants() {\n\n    var mid = gScale(Galaxy.GALACTIC_RADIUS)\n\n    drawLine(0, mid, size.x, mid, '#aaaaaa')\n    drawLine(mid, 0, mid, size.y, '#aaaaaa')\n\n  }\n\n  function drawJoystick() {\n\n  }\n\n  function drawLine(x1, y1, x2, y2, style) {\n    context.beginPath()\n    context.moveTo(x1, y1)\n    context.lineTo(x2, y2)\n    context.lineWidth = .5\n    context.strokeStyle = style\n    context.stroke()\n  }\n\n\n\n\n\n  return render\n}\n//@ sourceURL=/renderer.js"
));

require.define("/touch.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Geo = require('./geometry')\n\nwindow.addEventListener('touchend', touchend, false)\n\nvar emitter = new (require('events').EventEmitter)\n\n\nmodule.exports = emitter\n\n\nvar touches = []\nfunction touchend (touch) {\n  emitter.emit('touchend', touch)\n\n  var changed = touch.changedTouches[0]\n  var changedPoint = Geo.point(changed.clientX, changed.clientY)\n\n  garbageCollectTouches()\n\n  var existing = touches.filter(function (touch) {\n    var t = touch.changedTouches[0]\n    return Geo.distance(Geo.point(t.clientX, t.clientY), changedPoint) < 30\n  })[0]\n\n  if (existing) {\n    emitter.emit('doubletap', touch)\n    console.log('doubletap')\n  }\n\n  touches.push(touch)\n\n  touch.preventDefault()\n}\n\nfunction garbageCollectTouches () {\n  var now = Date.now()\n  touches = touches.filter(function (touch) {\n    return now - touch.timeStamp < 300\n  })\n}\n\n//emitter.on('touchEnd', targeted)\n//@ sourceURL=/touch.js"
));

require.define("events",Function(['require','module','exports','__dirname','__filename','process','global'],"if (!process.EventEmitter) process.EventEmitter = function () {};\n\nvar EventEmitter = exports.EventEmitter = process.EventEmitter;\nvar isArray = typeof Array.isArray === 'function'\n    ? Array.isArray\n    : function (xs) {\n        return Object.prototype.toString.call(xs) === '[object Array]'\n    }\n;\nfunction indexOf (xs, x) {\n    if (xs.indexOf) return xs.indexOf(x);\n    for (var i = 0; i < xs.length; i++) {\n        if (x === xs[i]) return i;\n    }\n    return -1;\n}\n\n// By default EventEmitters will print a warning if more than\n// 10 listeners are added to it. This is a useful default which\n// helps finding memory leaks.\n//\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nvar defaultMaxListeners = 10;\nEventEmitter.prototype.setMaxListeners = function(n) {\n  if (!this._events) this._events = {};\n  this._events.maxListeners = n;\n};\n\n\nEventEmitter.prototype.emit = function(type) {\n  // If there is no 'error' event listener then throw.\n  if (type === 'error') {\n    if (!this._events || !this._events.error ||\n        (isArray(this._events.error) && !this._events.error.length))\n    {\n      if (arguments[1] instanceof Error) {\n        throw arguments[1]; // Unhandled 'error' event\n      } else {\n        throw new Error(\"Uncaught, unspecified 'error' event.\");\n      }\n      return false;\n    }\n  }\n\n  if (!this._events) return false;\n  var handler = this._events[type];\n  if (!handler) return false;\n\n  if (typeof handler == 'function') {\n    switch (arguments.length) {\n      // fast cases\n      case 1:\n        handler.call(this);\n        break;\n      case 2:\n        handler.call(this, arguments[1]);\n        break;\n      case 3:\n        handler.call(this, arguments[1], arguments[2]);\n        break;\n      // slower\n      default:\n        var args = Array.prototype.slice.call(arguments, 1);\n        handler.apply(this, args);\n    }\n    return true;\n\n  } else if (isArray(handler)) {\n    var args = Array.prototype.slice.call(arguments, 1);\n\n    var listeners = handler.slice();\n    for (var i = 0, l = listeners.length; i < l; i++) {\n      listeners[i].apply(this, args);\n    }\n    return true;\n\n  } else {\n    return false;\n  }\n};\n\n// EventEmitter is defined in src/node_events.cc\n// EventEmitter.prototype.emit() is also defined there.\nEventEmitter.prototype.addListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('addListener only takes instances of Function');\n  }\n\n  if (!this._events) this._events = {};\n\n  // To avoid recursion in the case that type == \"newListeners\"! Before\n  // adding it to the listeners, first emit \"newListeners\".\n  this.emit('newListener', type, listener);\n\n  if (!this._events[type]) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    this._events[type] = listener;\n  } else if (isArray(this._events[type])) {\n\n    // Check for listener leak\n    if (!this._events[type].warned) {\n      var m;\n      if (this._events.maxListeners !== undefined) {\n        m = this._events.maxListeners;\n      } else {\n        m = defaultMaxListeners;\n      }\n\n      if (m && m > 0 && this._events[type].length > m) {\n        this._events[type].warned = true;\n        console.error('(node) warning: possible EventEmitter memory ' +\n                      'leak detected. %d listeners added. ' +\n                      'Use emitter.setMaxListeners() to increase limit.',\n                      this._events[type].length);\n        console.trace();\n      }\n    }\n\n    // If we've already got an array, just append.\n    this._events[type].push(listener);\n  } else {\n    // Adding the second element, need to change to array.\n    this._events[type] = [this._events[type], listener];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.once = function(type, listener) {\n  var self = this;\n  self.on(type, function g() {\n    self.removeListener(type, g);\n    listener.apply(this, arguments);\n  });\n\n  return this;\n};\n\nEventEmitter.prototype.removeListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('removeListener only takes instances of Function');\n  }\n\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (!this._events || !this._events[type]) return this;\n\n  var list = this._events[type];\n\n  if (isArray(list)) {\n    var i = indexOf(list, listener);\n    if (i < 0) return this;\n    list.splice(i, 1);\n    if (list.length == 0)\n      delete this._events[type];\n  } else if (this._events[type] === listener) {\n    delete this._events[type];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.removeAllListeners = function(type) {\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (type && this._events && this._events[type]) this._events[type] = null;\n  return this;\n};\n\nEventEmitter.prototype.listeners = function(type) {\n  if (!this._events) this._events = {};\n  if (!this._events[type]) this._events[type] = [];\n  if (!isArray(this._events[type])) {\n    this._events[type] = [this._events[type]];\n  }\n  return this._events[type];\n};\n\n//@ sourceURL=events"
));

require.define("/simulation.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Geo = require('./geometry')\nvar Console = require('./console')\n\nmodule.exports = function (game) {\n\n  function tick() {\n\n  movePlanets(game.galaxy.planets)\n\n  movePlayer(game.me)\n\n  doOrbiting(game.me)\n\n  powerBudget(game.me)\n\n  //console.log(game.me.power, game.me.color)\n///  var distToTarget = game.target ? Geo.polarDistance(game.me.location, game.target.location) | 0 : null\n // console.log('target dist', distToTarget)\n}\n\n  return tick;\n}\n\nfunction movePlanets(planets) {\n  planets.forEach(function (planet) {\n    planet.location.a += 2 * Math.PI / planet.orbitalPeriod / 2\n    var loc = Geo.polarToCart(planet.location)\n    var eccentricity = Geo.polarToCart(planet.eccentricity)\n    loc = Geo.originate(loc, eccentricity)\n    planet.location = Geo.cartToPolar(loc)\n  })\n}\n\n\nfunction movePlayer(player) {\n\n  player.location.a += 2 * Math.PI / player.orbitalPeriod / 2\n\n\n  //player.heading += .5\n\n\n\n}\n\nvar CAPTURE_RATE = 5\n\nfunction doOrbiting(player) {\n  if (player.orbiting) {\n    var planet = player.orbiting\n\n    if(planet.owner !== player) {\n      player.power -= 30\n      console.log('capturing')\n\n      if (planet.alignment[planet.owner.id] > CAPTURE_RATE) {\n        planet.alignment[planet.owner.id] -= CAPTURE_RATE\n      } else {\n        planet.alignment[planet.owner.id] = 0\n        player.capture(planet)\n      }\n    } else {\n      if (!planet.alignment[player.id]) {\n        planet.alignment[player.id] = 0\n      }\n      if (planet.alignment[player.id] < 100) {\n        planet.alignment[player.id] += CAPTURE_RATE\n      }\n\n    }\n\n\n  }\n}\n\nfunction powerBudget(player) {\n\n  player.power += 6\n\n  if (player.shieldsUp) {\n    player.power -= 30\n\n    if (player.power < 333) {\n      player.shieldsUp = false\n    }\n  }\n\n  if (player.power > 999) {\n    player.power = 999\n  }\n\n  console.log(player.power)\n  if (player.power < 0) {\n    game.togglePause()\n    Console.clear()\n    Console.freeze('game over dude')\n  }\n\n}\n//@ sourceURL=/simulation.js"
));

require.define("/controls.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var Touch = require('./touch')\nvar Geo = require('./geometry')\n\nvar mouse = {x:0, y: 0}\n\nwindow.addEventListener('mousemove', function (e) {\n  mouse.x = e.clientX\n  mouse.y = e.clientY\n})\n\nvar keys = {\n  right: 37\n , up: 38\n , left: 39\n , down: 40\n , s: 83\n , t: 84\n , o: 79\n , l: 76\n , question: 191\n , esc: 27\n}\n\n\nmodule.exports = function(game, renderer) {\n\n\n  function handleKey(code) {\n\n\n    if (code === keys.t) {\n\n        game.target = getTarget(mouse)\n\n    }\n\n    if (code === keys.s) {\n      game.me.toggleShields()\n    }\n\n    else if (code === keys.left) {\n      game.me.heading += .3\n    }\n\n    else if (code === keys.right) {\n      game.me.heading -= .3\n    }\n\n    else if (code === keys.o) {\n      game.me.orbit(game.target)\n    }\n\n    else if (code === keys.l) {\n      game.opts.showLabels = !game.opts.showLabels\n    }\n\n    else if (code === keys.question) {\n\n    }\n\n    else if (code === keys.esc) {\n      game.togglePause()\n    }\n\n  }\n\n\n  Touch.on('touchend', function (e) {\n    var touch = e.changedTouches[0]\n    var point = Geo.point(touch.clientX, touch.clientY)\n\n    game.target = getTarget(e)\n  })\n\n\n  Touch.on('doubletap', function (e) {\n    var target = getTarget(e)\n    if (target && target.isPlanet) {\n      game.me.orbit(target)\n    }\n  })\n\n\n  function getTarget(point) {\n\n    var target = renderer.getTarget(point)\n    return target\n  }\n\n\n  return {\n    handleKey: handleKey\n  }\n\n\n\n\n}\n//@ sourceURL=/controls.js"
));

require.define("/node_modules/raf/package.json",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = {\"main\":\"index.js\"}\n//@ sourceURL=/node_modules/raf/package.json"
));

require.define("/node_modules/raf/index.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = raf\n\nvar EE = require('events').EventEmitter\n\nvar _raf =\n  this.requestAnimationFrame ||\n  this.webkitRequestAnimationFrame ||\n  this.mozRequestAnimationFrame ||\n  this.msRequestAnimationFrame ||\n  this.oRequestAnimationFrame ||\n  (this.setImmediate ? function(fn, el) {\n    setImmediate(fn)\n  } :\n  function(fn, el) {\n    setTimeout(fn, 0)\n  })\n\nfunction raf(el) {\n  var now = raf.now()\n    , ee = new EE\n\n  ee.pause = function() { ee.paused = true }\n  ee.resume = function() { ee.paused = false }\n\n  _raf(iter, el)\n\n  return ee\n\n  function iter(timestamp) {\n    var _now = raf.now()\n      , dt = _now - now\n    \n    now = _now\n\n    ee.emit('data', dt)\n\n    if(!ee.paused) {\n      _raf(iter, el)\n    }\n  }\n}\n\nraf.now = function() { return Date.now() }\n\n//@ sourceURL=/node_modules/raf/index.js"
));

require.define("/main.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var _ = {\n  random: require('./randomMember')\n}\nvar Player = require('./player')\nvar Planet = require('./planet')\nvar Renderer = require('./renderer')\nvar Galaxy = require('./galaxy')\nvar Touch = require('./touch')\nvar Simulation = require('./simulation')\nvar Controls = require('./controls')\nvar Console = require('./console')\n\nvar raf = require('raf')\n\n\nvar emitter = new (require('events').EventEmitter)\nprocess.emit = emitter.emit\nprocess.on = emitter.on\n\n\nvar screenCanvas = document.createElement('canvas')\nvar size;\ngetSize()\nscreenCanvas.width = size.x\nscreenCanvas.height = size.y\n\nvar body = document.getElementsByTagName('body')[0]\n\nbody.appendChild(screenCanvas)\n\n\nbody.appendChild(Console.init())\n\nConsole('Welcome to SPACE GAEM')\nsetTimeout(function () {\n  if ('ontouchend' in window) {\n    Console('Tap to target, Doubletap to orbit. Engage!')\n  } else {\n    Console('Mouse to aim, T to target, O to orbit. Engage!')\n  }\n  //Console('press ? for controls')\n}, 2000)\n\nvar screen = screenCanvas.getContext('2d')\n\n\n\n//// generate map\n// build some planets\n\nvar planets = _.random.range(0,7).map(Planet)\n\nconsole.log(planets)\n\n// make a player\nvar me = Player()\nme.homePlanet = _.random(planets)\nme.homePlanet.owner = me\nme.homePlanet.alignment[me.id] = 100\nme.location = me.homePlanet.location\nme.orbit(me.homePlanet)\n\n// set up galaxy\nvar galaxy = Galaxy()\ngalaxy.planets = planets\n\nvar simTick = true\n\nvar game = {\n  galaxy: galaxy,\n  me: me,\n  target: me.homePlanet,\n  opts: {},\n  togglePause: function () {\n    if (simTick) {\n      clearInterval(simTick)\n      simTick = null\n      Console('Paused!')\n    } else {\n      simTick = setInterval(sim, 250)\n      Console('Resumed!')\n    }\n  }\n}\n\n\n\nvar render = Renderer(screen, size, game)\nvar controls = Controls(game, render)\n\nvar renderClock = raf(screen)\n\nrenderClock.on('data', function () {\n  render()\n  //renderClock.pause()\n})\n\nvar sim = Simulation(game)\n\nsimTick = setInterval(sim, 50)\n\n\n\n\nfunction getSize() {\n  size = {\n    x: window.innerWidth\n  , y: window.innerHeight\n  }\n}\n\nwindow.addEventListener('resize', getSize, false)\n\n\n\nwindow.addEventListener('touchmove', function (e) {\n  e.preventDefault()\n})\n\nwindow.addEventListener('keydown', function (e) {\n  console.log(e.keyCode, e)\n  controls.handleKey(e.keyCode)\n  if (!e.metaKey) {\n    e.preventDefault()\n  }\n}, false)\n\n\nwindow.debug = {\n  planets: function (name) {\n    return game.galaxy.planets.filter(function (planet) {\n      return planet.name.toLowerCase() === name.toLowerCase()\n    })[0]\n  },\n  me: game.me,\n  game: game\n}\n\n\nprocess.on('captured', function () {\n  var remaining = game.galaxy.planets.filter(function (planet) {\n    return planet.owner !== game.me\n  })\n  if (remaining.length < 3 && remaining.length > 0) {\n    var one = remaining.length === 1;\n    Console(remaining.length + ' planet' + (one ? '' : 's') + ' remain' + (one ? 's' : '') + '!')\n  }\n  else if (remaining.length === 0) {\n    game.togglePause()\n    Console.clear()\n    Console.freeze('Flawless victory!')\n  }\n})\n\n//@ sourceURL=/main.js"
));
require("/main.js");
})();
