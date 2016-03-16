"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = undefined;

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Cache = exports.Cache = function () {
  function Cache() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Cache);

    this.items = {};
    this.cacheExpirationTimeout = options.cacheExpirationTimeout || 1000 * 60;
  }

  (0, _createClass3.default)(Cache, [{
    key: "_ensureItem",
    value: function _ensureItem(query, vars) {
      var key = this._generateKey(query, vars);
      if (!this.items[key]) {
        this.items[key] = {
          query: query,
          vars: vars,
          payload: undefined,
          callbacks: []
        };
      }

      return this.items[key];
    }
  }, {
    key: "_generateKey",
    value: function _generateKey(query, vars) {
      var varsJson = (0, _stringify2.default)(vars || {});
      return query + "::" + varsJson;
    }
  }, {
    key: "watchItem",
    value: function watchItem(query, vars, watcher) {
      var _this = this;

      var item = this._ensureItem(query, vars);
      var key = this._generateKey(query, vars);

      if (item.payload !== undefined) {
        watcher(null, item.payload);
      }

      if (item.expireHandler) {
        clearTimeout(item.expireHandler);
        item.expireHandler = null;
      }

      item.callbacks.push(watcher);

      // Return a callback to stop watching
      return function () {
        var index = item.callbacks.indexOf(watcher);
        item.callbacks.splice(index, 1);
        // We don't need to keep a reference for not watching items
        if (item.callbacks.length === 0) {
          item.expireHandler = setTimeout(function () {
            delete _this.items[key];
          }, _this.cacheExpirationTimeout);
        }
      };
    }
  }, {
    key: "getItemPayload",
    value: function getItemPayload(query, vars) {
      var key = this._generateKey(query, vars);
      var item = this.items[key];
      if (item) {
        return this._clone(item.payload);
      }
    }
  }, {
    key: "setItemPayload",
    value: function setItemPayload(query, vars, payload) {
      var _this2 = this;

      var item = this._ensureItem(query, vars);
      item.payload = this._clone(payload);
      item.callbacks.forEach(function (c) {
        return c(null, _this2._clone(payload));
      });
    }
  }, {
    key: "fireError",
    value: function fireError(query, vars, error) {
      var key = this._generateKey(query, vars);
      var item = this.items[key];
      if (!item) {
        return;
      }

      item.callbacks.forEach(function (c) {
        return c(error);
      });
    }
  }, {
    key: "removeItem",
    value: function removeItem(query, vars) {
      var key = this._generateKey(query, vars);
      delete this.items[key];
    }
  }, {
    key: "getItem",
    value: function getItem(query, vars) {
      var key = this._generateKey(query, vars);
      return this.items[key];
    }
  }, {
    key: "_clone",
    value: function _clone(payload) {
      return JSON.parse((0, _stringify2.default)(payload));
    }
  }]);
  return Cache;
}();

exports.default = Cache;