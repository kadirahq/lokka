'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Lokka = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Lokka = function () {
  function Lokka() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Lokka);

    this._transport = options.transport;
    this._fragments = {};
    this._validateTransport(this._transport);
    this.cache = new _cache2.default();
    this._fetchingQueries = {};
  }

  (0, _createClass3.default)(Lokka, [{
    key: '_validateTransport',
    value: function _validateTransport(transport) {
      if (!transport) {
        throw new Error('transport is required!');
      }

      if (typeof transport.send !== 'function') {
        throw new Error('transport should have a .send() method!');
      }
    }
  }, {
    key: 'send',
    value: function send(rawQuery, vars) {
      if (!rawQuery) {
        throw new Error('rawQuery is required!');
      }

      return this._transport.send(rawQuery, vars);
    }
  }, {
    key: 'createFragment',
    value: function createFragment(fragment) {
      if (!fragment) {
        throw new Error('fragment is required!');
      }

      // XXX: Validate query against the schema
      var name = 'f' + _uuid2.default.v4().replace(/-/g, '');
      var fragmentWithName = fragment.replace('fragment', 'fragment ' + name);
      this._fragments[name] = fragmentWithName;

      return name;
    }
  }, {
    key: '_findFragments',
    value: function _findFragments(queryOrFragment) {
      var _this = this;

      var fragmentsMap = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var matched = queryOrFragment.match(/\.\.\.[A-Za-z0-9]+/g);
      if (matched) {
        var fragmentNames = matched.map(function (name) {
          return name.replace('...', '');
        });
        fragmentNames.forEach(function (name) {
          var fragment = _this._fragments[name];
          if (!fragment) {
            throw new Error('There is no such fragment: ' + name);
          }

          fragmentsMap[name] = fragment;
          _this._findFragments(fragment, fragmentsMap);
        });
      }

      var fragmentsArray = (0, _keys2.default)(fragmentsMap).map(function (key) {
        return fragmentsMap[key];
      });

      return fragmentsArray;
    }
  }, {
    key: 'query',
    value: function query(_query, vars) {
      if (!_query) {
        throw new Error('query is required!');
      }

      // XXX: Validate query against the schema
      var fragments = this._findFragments(_query);
      var queryWithFragments = _query + '\n' + fragments.join('\n');

      return this.send(queryWithFragments, vars);
    }
  }, {
    key: 'mutate',
    value: function mutate(query, vars) {
      if (!query) {
        throw new Error('query is required!');
      }

      // XXX: Validate query against the schema
      var mutationQuery = 'mutation _ ' + query.trim();
      var fragments = this._findFragments(mutationQuery);
      var queryWithFragments = mutationQuery + '\n' + fragments.join('\n');

      return this.send(queryWithFragments, vars);
    }
  }, {
    key: 'watchQuery',
    value: function watchQuery(query, _vars, _callback) {
      var callback = _callback;
      var vars = _vars;

      if (!query) {
        throw new Error('query is required');
      }

      if (!callback) {
        callback = vars;
        vars = {};
      }

      if (typeof callback !== 'function') {
        throw new Error('You need to provide a callback to watch');
      }

      var hasItemAlready = Boolean(this.cache.getItem(query, vars));
      if (!hasItemAlready) {
        this._fetchToCache(query, vars);
      }
      return this.cache.watchItem(query, vars, callback);
    }
  }, {
    key: 'refetchQuery',
    value: function refetchQuery(query, vars) {
      if (!query) {
        throw new Error('query is required');
      }

      this._fetchToCache(query, vars);
    }
  }, {
    key: '_fetchToCache',
    value: function _fetchToCache(query, vars) {
      var _this2 = this;

      this.query(query, vars).then(function (payload) {
        _this2.cache.setItemPayload(query, vars, payload);
      }).catch(function (error) {
        _this2.cache.fireError(query, vars, error);
      });
    }
  }]);
  return Lokka;
}();

exports.Lokka = Lokka;
exports.default = Lokka;