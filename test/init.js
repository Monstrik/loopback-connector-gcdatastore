module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;
var Connector = require('../index');
var TEST_ENV = process.env.TEST_ENV || 'test';

var conf = {
  test: {
    gcdatastore: {}
  }
};
var config = {};
config = require('rc')('loopback', conf)[TEST_ENV].gcdatastore;


// if (process.env.CI) {
//   config = {
//     gcProject: "vroom-com",
//     connector: "loopback-connector-gcdatastore"
//   };
// }
config = {
  gcProject: "vroom-com",
  connector: "loopback-connector-gcdatastore"
};
global.config = config;


global.getDataSource = global.getSchema = function (customConfig) {
  var db = new DataSource(Connector, customConfig || config);
  db.log = function (a) {
    console.log(a);
  };

  return db;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
};

global.sinon = require('sinon');
