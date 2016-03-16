'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LokkaTransport = function () {
  function LokkaTransport() {
    (0, _classCallCheck3.default)(this, LokkaTransport);
  }

  (0, _createClass3.default)(LokkaTransport, [{
    key: 'send',

    /*eslint-disable */
    value: function send(rawQuery, variables, operationName) {
      throw new Error('not implemented!');
      // return new Promise();
    }
    /*eslint-enable */

  }]);
  return LokkaTransport;
}();

exports.default = LokkaTransport;