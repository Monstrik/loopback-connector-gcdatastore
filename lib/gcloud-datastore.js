var _ = require('lodash');
var assert = require('assert');
var util = require('util');

// Require the google cloud connector
var Datastore = require('@google-cloud/datastore');

// Require the base Connector class
var Connector = require('loopback-connector').Connector;

// Require the debug module with a pattern of loopback:connector:connectorName
var debug = require('debug')('loopback:connector:gcdatastore');

/**
 * Initialize the  connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
  debug('initialize invoked')
  dataSource.connector = new GCDConnector(dataSource.settings);

  if (callback) {
    callback();
  }
};

exports.GcloudDataStoreConnector = GCDConnector;

/**
 * Define the basic connector
 */
function GCDConnector(settings) {
  // Call the super constructor with name and settings

  Connector.call(this, 'gcdatastore', settings);
  debug("GCDConnector constructor", settings.gcProject);
  this.dataset = Datastore({
    projectId: settings.gcProject
  });
  // // Store properties
  // this.dataset = datastore.dataset({
  //     projectId: settings.projectId,
  //     keyFilename: settings.keyFilename || undefined,
  //     email: settings.email || undefined,
  //     namespace: settings.namespace || undefined
  // });
}

// Set up the prototype inheritence
util.inherits(GCDConnector, Connector);

GCDConnector.prototype.relational = false;

GCDConnector.prototype.getTypes = function () {
  return ['db', 'nosql', 'gcloud-datastore'];
};

GCDConnector.prototype.connect = function (callback) {
  if (callback) {
    callback();
  }
};

GCDConnector.prototype.disconnect = function (callback) {
  if (callback) {
    callback();
  }
};

GCDConnector.prototype.toDatabaseData = function (model, data) {
  debug('toDatabaseData: %s %s', model, JSON.stringify(data));
  var definition = this.getModelDefinition(model);
  var properties = definition.properties;
  var result = _.map(data, function (data, name) {
    var property = properties[name];
    var excluded = property ? property.index === false : true;

    return {
      name: name,
      value: data,
      excludeFromIndexes: excluded
    };
  });
  debug('toDatabaseData: result: %s', JSON.stringify(result));
  return result;
};

GCDConnector.prototype.all = function (model, filter, callback) {
  this.find(model, filter, callback);
};

GCDConnector.prototype.find = function (model, filter, callback) {
  debug('find: %s filter: %s', model, JSON.stringify(filter));

  // Setup
  var idName = this.idName(model);
  var ds = this.dataset;

  var query = ds.createQuery(model);

  // Define the filter support
  var filterClause = function (data, name) {
    // Sanity check
    data = data === undefined || data === null ? "" : data;
    debug('find: filterClause: name %s data %s ', name, data);
    // How to handle?
    if (idName == name) {
      debug('find: adding filter __key__ = %s', data);
      query.filter('__key__', '=', ds.key([model, data * 1]));
    } else if ('and' === name) {
      _.each(data, function (where) {
        _.each(where, filterClause);
      });
    } else if ('or' === name) {
      debug('find: UNSUPPORTED OR CLAUSE %s', JSON.stringify(data));
    } else {
      debug('find: adding filter %s = %s', name, JSON.stringify(data));
      query.filter(name + ' =', data);
    }
  };

  // Where clauses (including filtering on primary key)
  _.each(filter.where, filterClause);

  // Limit, Offset restrictions
  if (undefined !== filter.limit) {
    debug('find: adding limit %d', filter.limit);
    query = query.limit(filter.limit);
  }

  if (undefined !== filter.offset) {
    debug('find: adding offset %d', filter.offset);
    query = query.offset(filter.offset);
  }


  // // Show it
  // //debug('find: execute %s', JSON.stringify(query));
  // debug('find: query.namespace %s', JSON.stringify(query.namespace));
  // debug('find: query.filters %s', JSON.stringify(query.filters));
  // debug('find: query.orders %s', JSON.stringify(query.orders));
  // debug('find: query.groupByVal %s', JSON.stringify(query.groupByVal));
  // debug('find: query.selectVal %s', JSON.stringify(query.selectVal));
  // debug('find: query.startVal %s', JSON.stringify(query.startVal));
  // debug('find: query.endVal %s', JSON.stringify(query.endVal));
  // debug('find: query.limitVal %s', JSON.stringify(query.limitVal));
  // debug('find: query.offsetVal %s', JSON.stringify(query.offsetVal));

  // Run the query
  ds.runQuery(query, function (errors, result, cursor) {
    debug('find: results %s', JSON.stringify(errors || result));

    if (callback === null || callback === undefined) {
      return;
    }

    if (errors) {
      return callback(errors);
    }

    //Done


    result.forEach(function (entity) {
      entity.id = entity[ds.KEY].id;
    });
    callback(null, result);

    // callback(null, _.map(result, function (entity) {
    //   entity.id = entity[ds.KEY].id;
    //   ///entity.data[idName] = entity.key.path[1];
    //   return result;
    // }));
  });
};

GCDConnector.prototype.findById = function (model, id, callback) {
  debug('findById:', model, id);
  var ds = this.dataset;
  var key = ds.key([
    model,
    id * 1
  ]);

  ds.get(key)
    .then(function (results) {
      const data = results[0];
      debug('findById: found: id %s data %s', key.id, JSON.stringify(data));
      callback(null, data);
    });
};

GCDConnector.prototype.create = function (model, data, options, callback) {
  debug('create: %s %s %s', model, JSON.stringify(data), JSON.stringify(options));
  assert(data, 'Cannot save an empty entity into the database');

  // Setup
  var idName = this.idName(model);
  var id = data[idName];
  var ds = this.dataset;
  var key, definition;

  // Is there already an ID set for insert?
  if (id) {
    debug('create: using preset: %s %s', idName, id);
    key = ds.key([model, id]);
  } else {
    debug('create: no ID found on %s, will be auto-generated on insert', idName);
    key = ds.key(model);
  }

  // Exclude invalid properties if the model is defined as strict
  definition = this.getModelDefinition(model);

  if (definition.strict === true) {
    data = _.pick(data, _.keys(definition.properties));
  }

  // Convert to a proper DB format, with indexes off as needed
  data = this.toDatabaseData(model, data);

  // Update the data
  debug('create: execute %s', JSON.stringify(data));

  ds.save({
    key: key,
    data: data
  }, function (errors, result) {
    debug('create: result %s', JSON.stringify(errors || result));

    if (callback === null || callback === undefined) {
      return;
    }

    if (errors) {
      return callback(errors);
    }

    if (!key.path) {
      return callback('Internal error: missing key.path');
    }

    if (!key.path[1]) {
      return callback('Internal error: missing key.path[1]');
    }

    // Done
    callback(null, key.path[1]);
  });
};

GCDConnector.prototype.updateAttributes = function (model, id, data, options, callback) {
  debug('updateAttributes: %s %s %s %s', model, id, JSON.stringify(data), JSON.stringify(options));
  assert(id, 'Cannot update an entity without an existing ID');

  // For future reference
  var idName = this.idName(model);
  var ds = this.dataset;
  var key = ds.key([model, id * 1]);
  var definition = this.getModelDefinition(model);
  var self = this;

  // Find the existing data
  debug('updateAttributes: fetching pre-existing data first...');

  const transaction = ds.transaction();


  transaction.run()
    .then(function () {
      transaction.get(key)
    })
    .then(function (results) {
      debug('transaction.get data: %s', JSON.stringify(results));
      // var dataFromDB = results[0];
      // debug('new data: %s', JSON.stringify(data));
      // debug('db data: %s', JSON.stringify(dataFromDB));
      // data = _.merge(dataFromDB, data);
      // debug('merged data: %s', JSON.stringify(data));
      // data = _.omit(data, idName);
      // debug('omited data: %s', JSON.stringify(data));
      //
      // transaction.save({
      //   key: key,
      //   data: data
      // });
      transaction.commit();
    })
    .then(function () {
      debug('Item %s updated successfully.', id);
      callback(null, id);
    })
    .catch(function (err) {
        transaction.rollback();
        debug('transaction was rollbacked id', id);
        callback(err);
      }
    );


  // this.findById(model, id, function (errors, original) {
  //   if (errors) {
  //     return callback(errors, null);
  //   }debug('new data: %s', JSON.stringify(data));
  //   debug('db data: %s', JSON.stringify(original[0]));
  //
  //   // Exclude invalid properties
  //   if (definition.strict === true) {
  //     data = _.pick(data, _.keys(definition.properties));
  //   }
  //   debug('new data: %s', JSON.stringify(data));
  //   debug('db data: %s', JSON.stringify(original[0]));
  //   // Merge in new data over the old data
  //   data = _.merge(original[0], data);
  //   debug('merged data: %s', JSON.stringify(data));
  //
  //   // Delete the entityId from the incoming data if present
  //   data = _.omit(data, idName);
  //   debug('omited data: %s', JSON.stringify(data));
  //
  //   // Convert to a proper DB format, with indexes off as needed
  //   data = self.toDatabaseData(model, data);
  //
  //     // Showcase
  //   debug('updateAttributes: execute %s', JSON.stringify(data));
  //
  //   // Update the data
  //   ds.update({
  //     key: key,
  //     data: data
  //   }, function (errors, result) {
  //     debug('updateAttributes: result %s', JSON.stringify(errors || result));
  //
  //     if (callback === null || callback === undefined) {
  //       return;
  //     }
  //
  //     if (errors) {
  //       return callback(errors);
  //     }
  //
  //     // Done
  //     callback(null, id);
  //   });
  // });
};

/**
 * Replace properties for the model instance data
 * @param {String} model The name of the model
 * @param {*} id The instance id
 * @param {Object} data The model data
 * @param {Object} options The options object
 * @param {Function} [cb] The callback function
 */
GCDConnector.prototype.replaceById = function replace(model, id, data, options, cb) {
  debug('GcDatastore.prototype.replaceById', model, id, data);
  if (this.debug) debug('GcDatastore.prototype.replaceById', model, id, data);

  cb(null, 'replaceById not implemented yet');
  //var oid = this.coerceId(model, id);
  // this.replaceWithOptions(model, oid, data, {upsert: false}, function (err, data) {
  //     cb(err, data);
  // });
};

/**
 * Delete all matching model instances
 *
 * https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.15.0/datastore/dataset?method=delete
 *
 * @param {String} model The model name
 * @param {Object} where The where object
 * @param {Object} options The options object
 * @param {Function} callback The callback function
 */
GCDConnector.prototype.destroyAll = function (model, where, options, callback) {
  debug('destroyAll: %s %s %s', model, JSON.stringify(where), JSON.stringify(options));

  // Setup
  var idName = this.idName(model);
  var id = where[idName];
  var ds = this.dataset;
  var key = ds.key([model, id*1]);

  debug('destroyAll: execute %s', key);

  ds.delete(key, function (errors, result) {
    debug('destroyAll: result %s', JSON.stringify(errors || result));

    if (callback === null || callback === undefined) {
      return;
    }

    if (errors) {
      return callback(errors);
    }

    // Done
    callback(null, null);
  });
};

/**
 * Count all the records in the dataset that match.
 *
 * Since (in loopback) this method is called with an explicity where clause that
 * restricts the search to a single record by ID, the result of this call will only
 * ever be a 0 (not found) or a 1 (found).
 *
 * @param {String} model The model name
 * @param {Object} where The where clause
 * @param {Object} options The options object
 * @param {Function} callback The callback function
 * @return {Number} The total size of the result set found.
 */
GCDConnector.prototype.count = function (model, where, options, callback) {
  debug('count: %s %s %s', model, JSON.stringify(where), JSON.stringify(options));

  // Setup
  var idName = this.idName(model);

  // Redirect
  debug('count: redirecting to find...');

  return this.find(model, {
    where: where
  }, function (errors, result) {
    debug('count: result %s', JSON.stringify(errors || result));

    if (callback === null || callback === undefined) {
      return;
    }

    if (errors) {
      return callback(errors);
    }

    // Done
    callback(errors, Number(_.size(result || [])));
  });
};

module.exports = GCDConnector;
