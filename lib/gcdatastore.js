var Connector = require('loopback-connector').Connector;
const Datastore = require('@google-cloud/datastore');

require('util').inherits(GCDConnector, Connector);
var debug = require('debug')('loopback:loopback-connector-gcdatastore')
var projectId = undefined;

exports.initialize = function initializeDataSource(dataSource, callback) {
  if (dataSource.settings.debug) {
    debug("init loopback-connector-gcdatastore");
  }
  dataSource.connector = new GCDConnector(dataSource.settings);
  process.nextTick(function () {
    callback && callback();
  });
};


//constructor
function GCDConnector(dataSourceProps) {

  this.projectId = dataSourceProps.projectId
  debug("GCDConnector constructor");
  debug(dataSourceProps);
  //this.response = [{"id": 1, "name": "hello"}, {"id": 2, "name": "world"}];
  //Loopback will add all model definitions to _models with the model name as key.
  this._models = {};
}

//to retrieve model properties, we use this._models[model].properties
//to retrieve the id field name, we use this.idName(model).


//CRUD

GCDConnector.prototype.all = function (model, filter, callback) {
  debug("all method");
  if (filter && filter.where && filter.where.id) { //GET with id operation
    this.response.forEach(function (field) {
      if (filter.where.id === field.id) {
        callback(null, [field]);
        return;
      }
    });
  } else { //GET all operation
    callback(null, this.response);
  }
};

GCDConnector.prototype.create = function (model, data, callback) {
  debug("create method");
  if (data.id) {
    this.response.push(data);
  } else {
    data.id = this.response.length + 1;
    this.response.push(data);
  }
  callback(null, data.id);
};

GCDConnector.prototype.updateOrCreate = function (model, data, callback) {
  debug("updateOrCreate");
  var isCreate = true;
  for (var i = 0; i < this.response.length; i++) {
    if (this.response[i].id === data.id) {
      this.response[i].name = data.name;
      isCreate = false;
      callback(null, data);
      return;
    }
  }

  if (isCreate) {
    this.response.push(data);
    callback(null, data);
  }
};

GCDConnector.prototype.updateAttributes = function updateAttrs(model, id, data, callback) {
  debug("updateAttributes");
  callback(null, data);
};

GCDConnector.prototype.destroyAll = function destroy(model, where, callback) {
  debug("destroyAll");
  callback(null, []);
};

GCDConnector.prototype.update = function update(model, where, data, callback) {
  debug("update");
  callback(null, []);
};


//Discovery methods

GCDConnector.prototype.ping = function (callback) {
  debug("ping");
  callback(null);
};

GCDConnector.prototype.discoverModelDefinitions = function (options, callback) {
  debug("discoverModelDefinitions");
  var models = []
  callback(null, models);
};

GCDConnector.prototype.discoverModelProperties = function (objectName, options, callback) {
  debug("discoverModelProperties");
  callback(null, [{"name": "name", "type": "string", "length": 100, "required": true}]);
};

GCDConnector.prototype.discoverSchemas = function (objectName, options, callback) {
  this.discoverModelProperties(objectName, options, function (error, response) {
    debug(response);
    if (error) {
      callback && callback(error);
      return;
    }
    var schema = {
      name: objectName,
      options: {
        idInjection: true, // false - to remove id property
        sObjectName: objectName
      },
      properties: {}
    };

    if (response || response.length !== 0) {
      response.forEach(function (field) {
        var fieldProperties = {};
        Object.keys(field).forEach(function (fieldProperty) {
          fieldProperties[fieldProperty] = field[fieldProperty];
        });
        schema.properties[field["name"]] = fieldProperties;
      });
    }
    debug(schema);
    options.visited = options.visited || {};
    if (!options.visited.hasOwnProperty(objectName)) {
      options.visited[objectName] = schema;
    }
    callback && callback(null, options.visited);
  });
}
