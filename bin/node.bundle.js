module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/Users/japh/Projects/botpress-discord";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _config = __webpack_require__(2);
	
	var _config2 = _interopRequireDefault(_config);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var checkVersion = __webpack_require__(7);
	
	var Eris = __webpack_require__(8);
	var outgoing = __webpack_require__(9);
	var incoming = __webpack_require__(11);
	var actions = __webpack_require__(12);
	var Promise = __webpack_require__(14);
	
	
	var eris = null;
	var outgoingPending = outgoing.pending;
	
	var outgoingMiddleware = function outgoingMiddleware(event, next) {
	  if (event.platform !== "discord") {
	    return next();
	  }
	  if (!outgoing[event.type]) {
	    return next("Unsupported event type: " + event.type);
	  }
	
	  outgoing[event.type](event, next, eris);
	};
	
	module.exports = {
	  init: function init(bp) {
	
	    checkVersion(bp, __dirname);
	
	    bp.middlewares.register({
	      name: "discord.sendMessages",
	      type: "outgoing",
	      order: 100,
	      handler: outgoingMiddleware,
	      module: "botpress-discord",
	      description: "Sends out messages that targets platform = slack." + " This middleware should be placed at the end as it swallows events once sent."
	    });
	
	    bp.discord = {};
	    _lodash2.default.forIn(actions, function (action, name) {
	      bp.discord[name] = action;
	      var sendName = name.replace(/^create/, "send");
	      //console.log("Created action " + sendName)
	      bp.discord[sendName] = Promise.method(function () {
	        var msg = action.apply(this, arguments);
	        msg.__id = new Date().toISOString() + Math.random();
	        var resolver = { event: msg };
	        var promise = new Promise(function (resolve, reject) {
	          resolver.resolve = resolve;
	          resolver.reject = reject;
	        });
	        outgoingPending[msg.__id] = resolver;
	        bp.middlewares.sendOutgoing(msg);
	        return promise;
	      });
	    });
	    bp.discord.isSelf = function (id) {
	      return id === eris.user.id;
	    };
	    bp.discord.isPrivate = function (msg) {
	      return msg.channel.guild === undefined;
	    };
	  },
	  ready: function ready(bp) {
	    var config = (0, _config2.default)(bp);
	    eris = new Eris.Client(config.botToken.get());
	    bp.discord.raw = eris;
	    eris.connect();
	    incoming(bp, eris, config);
	  }
	};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _storage = __webpack_require__(4);
	
	var _storage2 = _interopRequireDefault(_storage);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	exports.default = function (bp) {
	  var configKeys = ["botToken", "useSelf"];
	
	  var configDefaults = {
	    botToken: null,
	    useSelf: false
	  };
	
	  var configStorage = (0, _storage2.default)(bp, configDefaults);
	
	  var config = configStorage.load();
	
	  var createConfigAccessMethods = function createConfigAccessMethods(key) {
	    return {
	      get: function get() {
	        return config[key];
	      },
	      set: function set(value) {
	        config[key] = value;
	        configStorage.save(config);
	      }
	    };
	  };
	
	  var accessMethods = _lodash2.default.reduce(configKeys, function (acc, key) {
	    return _extends({}, acc, _defineProperty({}, key, createConfigAccessMethods(key)));
	  }, {});
	
	  var extraMethods = {
	    getAll: function getAll() {
	      return config;
	    },
	    setAll: function setAll(newConfig) {
	      return _lodash2.default.forEach(configKeys, function (key) {
	        accessMethods[key].set(newConfig[key]);
	      });
	    }
	  };
	
	  return _extends({}, accessMethods, extraMethods);
	};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = require("lodash");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _path = __webpack_require__(5);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _fs = __webpack_require__(6);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var getFilePath = function getFilePath(bp, name) {
	  var projectLocation = bp.projectLocation,
	      modulesConfigDir = bp.botfile.modulesConfigDir;
	
	
	  var fileName = name ? 'botpress-discord-' + name + '.json' : 'botpress-discord.json';
	
	  return _path2.default.join(projectLocation, modulesConfigDir, fileName);
	};
	
	var writeJsonFile = function writeJsonFile(filePath, data) {
	  return _fs2.default.writeFileSync(filePath, JSON.stringify(data));
	};
	
	var readJsonFile = _lodash2.default.flow([_fs2.default.readFileSync, JSON.parse]);
	
	var createSaveFn = function createSaveFn(filePath) {
	  return function (data) {
	    return writeJsonFile(filePath, data);
	  };
	};
	
	var createLoadFn = function createLoadFn(filePath, defaultData) {
	  return function () {
	    if (!_fs2.default.existsSync(filePath)) {
	      createSaveFn(filePath)(defaultData);
	      return defaultData;
	    }
	
	    return readJsonFile(filePath);
	  };
	};
	
	exports.default = function (bp, defaultData, name) {
	  var filePath = getFilePath(bp, name);
	
	  return {
	    save: createSaveFn(filePath),
	    load: createLoadFn(filePath, defaultData)
	  };
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	module.exports = require("botpress-version-manager");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = require("eris");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var rp = __webpack_require__(10);
	
	var handlePromise = function handlePromise(next, promise) {
	  return promise.then(function (res) {
	    next();
	    return res;
	  }).catch(function (err) {
	    next(err);
	    throw err;
	  });
	};
	
	var handleText = function handleText(event, next, discord) {
	  if (event.platform !== "discord" || event.type !== "text") {
	    return next();
	  }
	
	  var channelId = event.raw.channelId;
	  var text = event.text;
	  var raw = typeof event.raw !== "string" ? event.raw : {};
	  var embed = event.raw.embed ? event.raw.embed : false;
	
	  return handlePromise(next, discord.createMessage(channelId, { "content": text }));
	  //return handlePromise(next, discord.createMessage(channelId, {"content": text, "embed": embed}))
	};
	
	var handleTyping = function handleTyping(event, next, discord) {
	  if (event.platform !== "discord" || event.type !== "typing") {
	    return next();
	  }
	
	  var channelId = event.raw.channelId;
	  var text = event.text;
	  var raw = typeof event.raw !== "string" ? event.raw : {};
	
	  return handlePromise(next, discord.createMessage(channelId, { "content": text }));
	};
	
	var handleAttachment = function handleAttachment(event, next, discord) {
	  if (event.platform !== "discord" || event.type !== "attachment") {
	    return next();
	  }
	
	  var channelId = event.raw.channelId;
	  var description = event.text;
	  var filename = event.raw.filename;
	  var uri = event.raw.uri;
	
	  var pr = new Promise(function (resolve, reject) {
	    rp(uri).then(function (str) {
	      resolve(discord.createMessage(channelId, description, { name: filename, file: Buffer.from(str) }));
	    }).catch(function (err) {
	      reject(err);
	    });
	  });
	  return handlePromise(next, pr);
	};
	
	var handleImage = function handleImage(event, next, discord) {
	  if (event.platform !== "discord" || event.type !== "image") {
	    return next();
	  }
	  var channelId = event.raw.channelId;
	  var uri = event.raw.uri;
	  var filetype = event.raw.type || "png";
	  var filename = Date.now() + "." + filetype;
	
	  var pr = new Promise(function (resolve, reject) {
	    rp({ uri: uri, encoding: null }).then(function (buff) {
	      resolve(discord.createMessage(channelId, "", { name: filename, file: Buffer.from(buff) }));
	    }).catch(function (err) {
	      reject(err);
	    });
	  });
	  return handlePromise(next, pr);
	};
	
	var handleTextUpdate = function handleTextUpdate(event, next, discord) {
	  if (event.platform !== "discord" || event.type !== "textUpdate") {
	    return next();
	  }
	
	  var channelId = event.raw.channelId;
	  var msgId = event.raw.msgId;
	  var text = event.raw.msg;
	
	  return handlePromise(next, discord.editMessage(channelId, msgId, text));
	};
	
	module.exports = {
	  "text": handleText,
	  "typing": handleTyping,
	  "attachment": handleAttachment,
	  "image": handleImage,
	  "textUpdate": handleTextUpdate,
	  pending: {}
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	module.exports = require("request-promise");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _outgoing = __webpack_require__(9);
	
	var _outgoing2 = _interopRequireDefault(_outgoing);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	module.exports = function (bp, discord, config) {
	  discord.on("messageCreate", function (msg) {
	
	    // This seems more or less required by the botpress framework
	    // It probably shouldn't though !
	    bp.db.saveUser({
	      id: msg.author.id,
	      platform: 'discord',
	      gender: null,
	      timezone: null,
	      locale: null,
	      picture_url: null,
	      first_name: msg.author.username,
	      last_name: null
	    }).then(function () {
	
	      if (config.useSelf.get() === true) {
	        if (bp.discord.isSelf(msg.author.id)) {
	          bp.middlewares.sendIncoming({
	            platform: "discord",
	            type: "message",
	            user: msg.author,
	            text: msg.content,
	            channel: msg.channel,
	            raw: msg
	          });
	        }
	      } else {
	        if (!bp.discord.isSelf(msg.author.id)) {
	          bp.middlewares.sendIncoming({
	            platform: "discord",
	            type: "message",
	            user: msg.author,
	            text: msg.content,
	            channel: msg.channel,
	            raw: msg
	          });
	        }
	      }
	    });
	  });
	
	  discord.on("ready", function () {
	    bp.middlewares.sendIncoming({
	      platform: "discord",
	      type: "ready",
	      user: "",
	      text: "",
	      discord: discord,
	      raw: discord
	    });
	  });
	
	  discord.on("typingStart", function (event, user) {
	    bp.middlewares.sendIncoming({
	      platform: "discord",
	      type: "typing",
	      user: user,
	      channelID: event.id,
	      text: "",
	      raw: { "event": event, "user": user }
	    });
	  });
	
	  discord.on("presenceUpdate", function (event) {
	    bp.middlewares.sendIncoming({
	      platform: "discord",
	      type: "status",
	      user: event.user,
	      text: "",
	      status: event.status,
	      game: event.game ? event.game : { type: false, name: false },
	      raw: event
	    });
	  });
	};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var embeds = __webpack_require__(13);
	
	
	var createText = function createText(chId, txt) {
	  var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	
	
	  var raw = Object.assign({
	    channelId: chId,
	    message: txt.trim()
	  }, extra);
	
	  return {
	    platform: "discord",
	    type: "text",
	    text: typeof txt === "string" ? txt : "",
	    raw: raw
	  };
	};
	
	var createAttachment = function createAttachment(chId, description, uri) {
	  var filename = uri.split('/').pop().split('#')[0].split('?')[0];
	  return {
	    platform: "discord",
	    type: "attachment",
	    text: description,
	    raw: {
	      filename: filename,
	      uri: uri,
	      channelId: chId
	    }
	  };
	};
	
	var createImage = function createImage(chId, uri, filetype) {
	  return {
	    platform: "discord",
	    type: "image",
	    text: "",
	    raw: {
	      uri: uri,
	      channelId: chId,
	      type: filetype || "png"
	    }
	  };
	};
	
	var createTextUpdate = function createTextUpdate(chId, msgId, content) {
	  return {
	    platform: "discord",
	    type: "textUpdate",
	    text: "",
	    raw: {
	      channelId: chId,
	      msgId: msgId,
	      msg: content
	    }
	  };
	};
	
	var createTyping = function createTyping(chId, txt) {
	  var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	
	
	  var raw = Object.assign({
	    channelId: chId,
	    message: txt.trim()
	  }, extra);
	
	  return {
	    platform: "discord",
	    type: "typing",
	    text: "",
	    raw: raw
	  };
	};
	
	module.exports = {
	  createText: createText,
	  createTyping: createTyping,
	  createAttachment: createAttachment,
	  createImage: createImage,
	  createTextUpdate: createTextUpdate
	};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	"use strict";

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	module.exports = require("bluebird");

/***/ })
/******/ ]);
//# sourceMappingURL=node.bundle.js.map