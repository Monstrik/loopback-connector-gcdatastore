var _ = require('lodash');
var assert = require('assert');

// Require the google cloud connector
var Datastore = require('@google-cloud/datastore');

// Require the base Connector class
var Connector = require('loopback-connector').Connector;
// Require the debug module with a pattern of loopback:connector:connectorName
var debug = require('debug')('loopback:connector:gcdatastore')

// Set up the prototype inheritence
require('util').inherits(GCDConnector, Connector);

var ds = undefined;
var projectId = undefined;

/**
 * Initialize the  connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, cb) {
  debug('initialize invoked');
  if (!Datastore) {
    debug('Datastore lib not found');
    return;
  } else {
    debug('Datastore lib found');
  }

  var s = dataSource.settings;
  ds = Datastore({
    projectId: s.gcProject
  });

  dataSource.connector = new GCDConnector(dataSource.settings);

  if (cb) {
    process.nextTick(cb);
  }
};


/**
 * constructor: Define the basic connector
 */
function GCDConnector(dataSourceProps) {

  // Call the super constructor with name and settings
  Connector.call(this, 'loopback-connector-gcdatastore', dataSourceProps);
  debug("GCDConnector constructor", settings.gcProject);

  this.debug = dataSourceProps.debug || debug.enabled;
  this.projectId = dataSourceProps.projectId
  debug("GCDConnector constructor");
  debug(dataSourceProps);
  //this.response = [{"id": 1, "name": "hello"}, {"id": 2, "name": "world"}];
  //Loopback will add all model definitions to _models with the model name as key.
  this._models = {};



GCDConnector.prototype.relational = false;

GCDConnector.prototype.getTypes = function () {
  return ['db', 'nosql', 'loopback-connector-gcdatastore'];
};


GCDConnector.prototype.connect = function (cb) {
  debug("GCDConnector.prototype.connect method invoked");
  if (cb) {
    process.nextTick(cb);
  }
};

GCDConnector.prototype.disconnect = function (cb) {
  debug("GCDConnector.prototype.disconnect method invoked");
  if (cb) {
    process.nextTick(cb);
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


//CRUD

/**
 * Find matching model instances by the filter
 *
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @param {Function} [callback] The callback function
 */
GCDConnector.prototype.all = function (model, filter, callback) {
  debug("GCDConnector.prototype.all method invoked");

  var self = this;
  if (self.debug) {
    debug('all model', model, ' with filter:', filter);
  }

  const query = ds.createQuery([model]);


  ds.runQuery(query)
    .then(function (results) {
      const result = results[0];
      result.forEach(function (item) {
        const itemKey = item[ds.KEY];
        item.id = itemKey.id;
      });
      callback(null, result);
    });

  // const query = ds.createQuery('Task')
  //   .filter('done', '=', false)
  //   .filter('priority', '>=', 4)
  //   .order('priority', {
  //     descending: true
  //   });


  // ds.runQuery(query)
  //   .then(function (results) {
  //     // Task entities found.
  //     const tasks = results[0];
  //
  //     console.log('Tasks:');
  //     tasks.forEach((task) = > console.log(task)
  //     )
  //     ;
  //   });


  // ds.runQuery(q, function (err, entities, nextQuery) {
  //   if (err) {
  //     return callback(err);
  //   }
  //
  //   debug('entities', JSON.stringify(entities))
  //   const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
  //   //callback(null, entities.map(fromDatastore), hasMore);
  //   callback(null, entities, hasMore);
  // });


//
//
//     //
//     // filter = filter || {};
//     // var idName = self.idName(model);
//     // var query = {};
//     // if (filter.where) {
//     //     if (filter.where[idName]) {
//     //         var id = filter.where[idName];
//     //         delete filter.where[idName];
//     //         if (id.constructor !== Object) {
//     //             // {id: value}
//     //             id = self.coerceId(model, id);
//     //         }
//     //         filter.where._id = id;
//     //     }
//     //     query = self.buildWhere(model, filter.where);
//     // }
//     // var fields = filter.fields;
//     // if (fields) {
//     //     this.execute(model, 'find', query, fields, processResponse);
//     // } else {
//     //     this.execute(model, 'find', query, processResponse);
//     // }
//     //
//     // function processResponse(err, cursor) {
//     //     if (err) {
//     //         return callback(err);
//     //     }
//     //     var order = {};
//     //
//     //     // don't apply sorting if dealing with a geo query
//     //     if (!hasNearFilter(filter.where)) {
//     //         if (!filter.order) {
//     //             var idNames = self.idNames(model);
//     //             if (idNames && idNames.length) {
//     //                 filter.order = idNames;
//     //             }
//     //         }
//     //         if (filter.order) {
//     //             var keys = filter.order;
//     //             if (typeof keys === 'string') {
//     //                 keys = keys.split(',');
//     //             }
//     //             for (var index = 0, len = keys.length; index < len; index++) {
//     //                 var m = keys[index].match(/\s+(A|DE)SC$/);
//     //                 var key = keys[index];
//     //                 key = key.replace(/\s+(A|DE)SC$/, '').trim();
//     //                 if (key === idName) {
//     //                     key = '_id';
//     //                 }
//     //                 if (m && m[1] === 'DE') {
//     //                     order[key] = -1;
//     //                 } else {
//     //                     order[key] = 1;
//     //                 }
//     //             }
//     //         } else {
//     //             // order by _id by default
//     //             order = {_id: 1};
//     //         }
//     //         cursor.sort(order);
//     //     }
//     //
//     //     if (filter.limit) {
//     //         cursor.limit(filter.limit);
//     //     }
//     //     if (filter.skip) {
//     //         cursor.skip(filter.skip);
//     //     } else if (filter.offset) {
//     //         cursor.skip(filter.offset);
//     //     }
//     //     cursor.toArray(function (err, data) {
//     //         if (self.debug) {
//     //             debug('all', model, filter, err, data);
//     //         }
//     //         if (err) {
//     //             return callback(err);
//     //         }
//     //         var objs = data.map(function (o) {
//     //             if (idIncluded(fields, self.idName(model))) {
//     //                 self.setIdValue(model, o, o._id);
//     //             }
//     //             // Don't pass back _id if the fields is set
//     //             if (fields || idName !== '_id') {
//     //                 delete o._id;
//     //             }
//     //             o = self.fromDatabase(model, o);
//     //             return o;
//     //         });
//     //         if (filter && filter.include) {
//     //             self._models[model].model.include(objs, filter.include, options, callback);
//     //         } else {
//     //             callback(null, objs);
//     //         }
//     //     });
//     // }


};


GCDConnector.prototype.find = function (model, filter, callback) {
  debug('find: kind: %s filter: %s', model, JSON.stringify(filter));

  // Setup
  var idName = this.idName(model);
  var ds = this.dataset;
  var query = ds.createQuery(model);


  // filter support for where clauses
  var filterClause = function (data, name) {

    debug('filterClause: %s %s', JSON.stringify(data), name);

    // Sanity check
    data = data === undefined || data === null ? "" : data;

    // filter by key
    if (idName == name) {
      debug('filterClause model: adding filter __key__ = %s', data);

      var key = ds.key([model, data * 1]);
      if (!isNaN(data)) {
        key = ds.key([model, Number(data)]);
      }

      query = query.filter('__key__', key);
    }
    else if ('property' === name) {
      debug('filterClause property');
    }
    else if ('accessType' === name) {
      debug('filterClause accessType');
    }
    else if ('and' === name) {
      _.each(data, function (where) {
        _.each(where, filterClause);
      });
    }
    else if ('or' === name) {
      debug('find: UNSUPPORTED OR CLAUSE %s', JSON.stringify(data));
    }
    else {
      debug('find: adding filter %s = %s', name, JSON.stringify(data));
      query = query.filter(name, data);
    }
  };


  // Where clauses (including filtering on primary key)
  _.each(filter.where, filterClause);


  // Limit restrictions
  if (undefined !== filter.limit) {
    debug('find: adding limit %d', filter.limit);
    query = query.limit(filter.limit);
  }

  // Offset restrictions
  if (undefined !== filter.offset) {
    debug('find: adding offset %d', filter.offset);
    query = query.offset(filter.offset);
  }

  // Order restrictions
  if (undefined !== filter.order) {
    debug('find: adding order %d', filter.order);
    if ('DESC' === filter.order.split(' ')[1]) {
      query = query.order(filter.order.split(' ')[0], {
        descending: true
      });
    } else {
      query = query.order(filter.order.split(' ')[0]);
    }
  }

  // Show it
  debug('find: execute query %s', JSON.stringify(query));

  // Run the query
  ds.runQuery(query, function (errors, result, info) {
    debug('find: results %s', JSON.stringify(errors || result));

    if (callback === null || callback === undefined) {
      return;
    }

    if (errors) {
      return callback(errors);
    }
    // Done
    callback(null, _.map(result, function (entity) {
      if (entity[idName] === null || entity[idName] === undefined) {
        entity[idName] = entity[ds.KEY].id;
      }
      return entity;
    }));
  });
};


GCDConnector.prototype.findById = function (model, id, callback) {
  debug('findById: ', model, id);

  var idName = this.idName(model);
  debug('idName;', idName)
  var filters = {
    where: {},
    limit: 1
  };

  filters.where[idName] = id;
  return _.first(this.find(model, filters, callback));
};

/**
 * Create a new model instance for the given data
 * @param {String} model The model name
 * @param {Object} data The model data
 * @param {Function} [callback] The callback function
 */
GCDConnector.prototype.create = function (model, data, callback) {
  debug("GCDConnector.prototype.create method invoked");
  var self = this;
  if (self.debug) {
    debug('create model', model, 'with data:', data);
  }
  var key = ds.key(model);
  const entity = {
    key: key,
    data: data
  };
  debug('entity before save:', entity);
  ds.save(entity, function (err) {
      data.id = entity.key.id;
      debug('data after save:', data);
      callback(err, err ? null : data.id);
    }
  );
};

GCDConnector.prototype.updateOrCreate = function (model, data, callback) {
//transaction example// const transaction = datastore.transaction();
// const taskKey = datastore.key([
//   'Task',
//   taskId
// ]);
//
// return transaction.run()
//     .then(() => transaction.get(taskKey))
// .then((results) => {
//   const task = results[0];
// task.done = true;
// transaction.save({
//   key: taskKey,
//   data: task
// });
// return transaction.commit();
// })
// .then(() => {
//   // The transaction completed successfully.
//   console.log(`Task ${taskId} updated successfully.`);
// })
// .catch(() => transaction.rollback());
  debug("updateOrCreate invoked");
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
  debug("destroyAll model:", model, " where:", where);

  if (where.id) {
    var id = where.id * 1;
    const itemKey = ds.key([
      model,
      id
    ]);
    debug('itemKey', JSON.stringify(itemKey));
    return ds.delete(itemKey)
      .then(function (data) {
        debug('delete data', JSON.stringify(data));
        if (data[0].indexUpdates > 0) {
          callback(null, [id]);
        }
        else {
          newErrMsg = 'not found';
          newErr = new Error(newErrMsg);
          newErr.statusCode = 404;
          callback(newErr);
        }
      });
  }
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


//helpers


GCDConnector.prototype.toDatabaseData = function (model, data) {
  var definition = this.getModelDefinition(model);
  var properties = definition.properties;

  return _.map(data, function (data, name) {
    var property = properties[name];
    var excluded = property ? property.index === false : true;

    return {
      name: name,
      value: data,
      excludeFromIndexes: excluded
    };
  });
};


/**
 * Execute a command
 * @param {String} model The model name
 * @param {String} command The command name
 * @param [...] params Parameters for the given command
 */

// GCDConnector.prototype.execute = function (model, command) {
//   debug('GcDatastore.prototype.execute command=', command)
//
//   var collection = this.collection(model);
//   debug('GcDatastore.prototype.execute model=', model)
//
//   // Get the parameters for the given command
//   var args = [].slice.call(arguments, 2);
//   debug('GcDatastore.prototype.execute args=', args)
//
//   // The last argument must be a callback function
//   var callback = args[args.length - 1];
//   var context = {
//     model: model,
//     collection: collection, req: {
//       command: command,
//       params: args,
//     },
//   };
//   this.notifyObserversAround('execute', context, function (context, done) {
//     args[args.length - 1] = function (err, result) {
//       debug('my callbacck=')
//
//       if (err) {
//         debug('Error: ', err);
//       } else {
//         context.res = result;
//         debug('Result: ', result);
//       }
//       done(err, result);
//     };
//     debug('GcDatastore: model=%s command=%s', model, command, args);
//     return collection[command].apply(collection, args);
//   }, callback);
// };


// /*!
//  * Module dependencies
//  */
// var g = require('strong-globalize')();
//
// var mongodb = require('mongodb');
// var gcDatastore = require('@google-cloud/datastore');
// var ds;
// var util = require('util');
// var async = require('async');
// var Connector = require('loopback-connector').Connector;
// var debug = require('debug')('loopback:connector:gcdatastore');
//
// /*!
//  * Convert the id to be a BSON ObjectID if it is compatible
//  * @param {*} id The id value
//  * @returns {ObjectID}
//  */
// function ObjectID(id) {
//     if (id instanceof mongodb.ObjectID) {
//         return id;
//     }
//     if (typeof id !== 'string') {
//         return id;
//     }
//     try {
//         // GcDatastore's ObjectID constructor accepts number, 12-byte string or 24-byte
//         // hex string. For LoopBack, we only allow 24-byte hex string, but 12-byte
//         // string such as 'line-by-line' should be kept as string
//         if (/^[0-9a-fA-F]{24}$/.test(id)) {
//             return new mongodb.ObjectID(id);
//         } else {
//             return id;
//         }
//     } catch (e) {
//         return id;
//     }
// }
//
// /*!
//  * Generate the mongodb URL from the options
//  */
// function generateMongoDBURL(options) {
//     options.hostname = (options.hostname || options.host || '127.0.0.1');
//     options.port = (options.port || 27017);
//     options.database = (options.database || options.db || 'test');
//     var username = options.username || options.user;
//     if (username && options.password) {
//         return 'mongodb://' + username + ':' + options.password + '@' + options.hostname + ':' + options.port + '/' + options.database;
//     } else {
//         return 'mongodb://' + options.hostname + ':' + options.port + '/' + options.database;
//     }
// }
//
//
// // Translates from Datastore's entity format to
// // the format expected by the application.
// //
// // Datastore format:
// //   {
// //     key: [kind, id],
// //     data: {
// //       property: value
// //     }
// //   }
// //
// // Application format:
// //   {
// //     id: id,
// //     property: value
// //   }
// function fromDatastore(obj) {
//     return obj;
//     // obj.data.id = obj.key.id;
//     // return obj.data;
// }
//
// // Translates from the application's format to the datastore's
// // extended entity property format. It also handles marking any
// // specified properties as non-indexed. Does not translate the key.
// //
// // Application format:
// //   {
// //     id: id,
// //     property: value,
// //     unindexedProperty: value
// //   }
// //
// // Datastore extended format:
// //   [
// //     {
// //       name: property,
// //       value: value
// //     },
// //     {
// //       name: unindexedProperty,
// //       value: value,
// //       excludeFromIndexes: true
// //     }
// //   ]
// function toDatastore(obj, nonIndexed) {
//
//     return obj;
//     // nonIndexed = nonIndexed || [];
//     // const results = [];
//     // Object.keys(obj).forEach(function (k) {
//     //     if (obj[k] === undefined) {
//     //         return;
//     //     }
//     //     results.push({
//     //         name: k,
//     //         value: obj[k],
//     //         excludeFromIndexes: nonIndexed.indexOf(k) !== -1
//     //     });
//     // });
//     // return results;
// }
//
//
// /**
//  * Initializeconst Datastore = require('@google-cloud/datastore'); the GcDatastore connector for the given data source
//  * @param {DataSource} dataSource The data source instance
//  * @param {Function} [callback] The callback function
//  */
// exports.initialize = function initializeDataSource(dataSource, callback) {
//     debug('initializeDataSource');
//
//     if (!gcDatastore) {
//         debug('gcDatastore lib not found');
//         return;
//     } else {
//         debug('gcDatastore lib found');
//     }
//
//
//     var s = dataSource.settings;
//     debug('dataSource.settings', s);
//
//
//     s.safe = (s.safe !== false);
//     s.w = s.w || 1;
//     s.url = s.url || generateMongoDBURL(s);
//
//     ds = gcDatastore({
//         projectId: s.gcProject
//     });
//
//     debug('gc-Project', s.gcProject);
//
//     dataSource.connector = new GcDatastore(s, dataSource);
//     dataSource.ObjectID = mongodb.ObjectID;
//
//     if (callback) {
//         if (s.lazyConnect) {
//             process.nextTick(function () {
//                 callback();
//             });
//         } else {
//             debug('tipa init');
//
//             dataSource.connector.connect(callback);
//         }
//     }
// };
//
// /**
//  * The constructor for GcDatastore connector
//  * @param {Object} settings The settings object
//  * @param {DataSource} dataSource The data source instance
//  * @constructor
//  */
// function GcDatastore(settings, dataSource) {
//     debug('constractor');
//     Connector.call(this, 'mongodb', settings);
//
//     this.debug = settings.debug || debug.enabled;
//
//     //TODO remove
//     this.debug = true;
//
//     if (this.debug) {
//         debug('Settings: %j', settings);
//     }
//
//     this.dataSource = dataSource;
//     if (this.settings.enableOptimisedfindOrCreate === true ||
//         this.settings.enableOptimisedFindOrCreate === true ||
//         this.settings.enableOptimizedfindOrCreate === true ||
//         this.settings.enableOptimizedFindOrCreate === true) {
//         GcDatastore.prototype.findOrCreate = optimizedFindOrCreate;
//     }
//     if (this.settings.enableGeoIndexing === true) {
//         GcDatastore.prototype.buildNearFilter = buildNearFilter;
//     } else {
//         GcDatastore.prototype.buildNearFilter = undefined;
//     }
// }
//
// util.inherits(GcDatastore, Connector);
//
// /**
//  * Connect to GcDatastore
//  * @param {Function} [callback] The callback function
//  *
//  * @callback callback
//  * @param {Error} err The error object
//  * @param {Db} db The mongo DB object
//  */
// GcDatastore.prototype.connect = function (callback) {
//     var self = this;
//     if (self.db) {
//         process.nextTick(function () {
//             callback && callback(null, self.db);
//         });
//     } else if (self.dataSource.connecting) {
//         self.dataSource.once('connected', function () {
//             process.nextTick(function () {
//                 callback && callback(null, self.db);
//             });
//         });
//     } else {
//         debug('tipa connect');
//         mongodb.MongoClient.connect(self.settings.url, self.settings, function (err, db) {
//             if (!err) {
//                 if (self.debug) {
//                     debug('GcDatastore connection is established: ' + self.settings.url);
//                 }
//                 self.db = db;
//             } else {
//                 if (self.debug || !callback) {
//                     g.error('{{GcDatastore}} connection is failed: %s %s', self.settings.url, err);
//                 }
//             }
//             callback && callback(err, db);
//         });
//     }
// };
//
//
//
// GcDatastore.prototype.getTypes = function () {
//     return ['db', 'nosql', 'mongodb'];
// };
//
// GcDatastore.prototype.getDefaultIdType = function () {
//     return ObjectID;
// };
//
// /**
//  * Get collection name for a given model
//  * @param {String} model Model name
//  * @returns {String} collection name
//  */
// GcDatastore.prototype.collectionName = function (model) {
//     var modelClass = this._models[model];
//     if (modelClass.settings.mongodb) {
//         model = modelClass.settings.mongodb.collection || model;
//     }
//     return model;
// };
//
// /**
//  * Access a GcDatastore collection by model name
//  * @param {String} model The model name
//  * @returns {*}
//  */
// GcDatastore.prototype.collection = function (model) {
//     if (!this.db) {
//         throw new Error(g.f('{{GcDatastore}} connection is not established'));
//     }
//     var collectionName = this.collectionName(model);
//     return this.db.collection(collectionName);
// };
//
// /*!
//  * Convert the data from database to JSON
//  *
//  * @param {String} model The model name
//  * @param {Object} data The data from DB
//  */
// GcDatastore.prototype.fromDatabase = function (model, data) {
//     if (!data) {
//         return null;
//     }
//     var props = this._models[model].properties;
//     for (var p in props) {
//         var prop = props[p];
//         if (prop && prop.type === Buffer) {
//             if (data[p] instanceof mongodb.Binary) {
//                 // Convert the Binary into Buffer
//                 data[p] = data[p].read(0, data[p].length());
//             }
//         } else if (prop && prop.type === String) {
//             if (data[p] instanceof mongodb.Binary) {
//                 // Convert the Binary into String
//                 data[p] = data[p].toString();
//             }
//         } else if (data[p] && prop && prop.type && prop.type.name === 'GeoPoint' &&
//             this.settings.enableGeoIndexing === true) {
//             data[p] = {
//                 lat: data[p].coordinates[1],
//                 lng: data[p].coordinates[0],
//             };
//         }
//     }
//
//     return data;
// };
//
// /*!
//  * Convert JSON to database-appropriate format
//  *
//  * @param {String} model The model name
//  * @param {Object} data The JSON data to convert
//  */
// GcDatastore.prototype.toDatabase = function (model, data) {
//     if (this.settings.enableGeoIndexing !== true) {
//         return data;
//     }
//
//     var props = this._models[model].properties;
//
//     for (var p in props) {
//         var prop = props[p];
//         if (data[p] && prop && prop.type && prop.type.name === 'GeoPoint') {
//             data[p] = {
//                 coordinates: [data[p].lng, data[p].lat],
//                 type: 'Point',
//             };
//         }
//     }
//
//     return data;
// };
//
// /**
//  * Execute a mongodb command
//  * @param {String} model The model name
//  * @param {String} command The command name
//  * @param [...] params Parameters for the given command
//  */
// GcDatastore.prototype.execute = function (model, command) {
//     debug('GcDatastore.prototype.execute command=', command)
//
//     var collection = this.collection(model);
//     debug('GcDatastore.prototype.execute model=', model)
//
//     // Get the parameters for the given command
//     var args = [].slice.call(arguments, 2);
//     debug('GcDatastore.prototype.execute args=', args)
//
//     // The last argument must be a callback function
//     var callback = args[args.length - 1];
//     var context = {
//         model: model,
//         collection: collection, req: {
//             command: command,
//             params: args,
//         },
//     };
//     this.notifyObserversAround('execute', context, function (context, done) {
//         args[args.length - 1] = function (err, result) {
//             debug('my callbacck=')
//
//             if (err) {
//                 debug('Error: ', err);
//             } else {
//                 context.res = result;
//                 debug('Result: ', result);
//             }
//             done(err, result);
//         };
//         debug('GcDatastore: model=%s command=%s', model, command, args);
//         return collection[command].apply(collection, args);
//     }, callback);
// };
//
// GcDatastore.prototype.coerceId = function (model, id) {
//     // See https://github.com/strongloop/loopback-connector-mongodb/issues/206
//     if (id == null) return id;
//     var self = this;
//     var idValue = id;
//     var idName = self.idName(model);
//
//     // Type conversion for id
//     var idProp = self.getPropertyDefinition(model, idName);
//     if (idProp && typeof idProp.type === 'function') {
//         if (!(idValue instanceof idProp.type)) {
//             idValue = idProp.type(id);
//             if (idProp.type === Number && isNaN(id)) {
//                 // Reset to id
//                 idValue = id;
//             }
//         }
//         if (typeof idValue === 'string') {
//             idValue = ObjectID(idValue);
//         }
//     }
//     return idValue;
// };
//
// /**
//  * Create a new model instance for the given data
//  * @param {String} model The model name
//  * @param {Object} data The model data
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.create = function (model, data, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('function.caller', GcDatastore.prototype.create.caller);
//         debug('create model', model, 'with data:', data);
//     }
//     var key = ds.key(model);
//     const entity = {
//         key: key,
//         data: data
//     };
//     debug('data before save:', entity);
//     ds.save(entity, function (err) {
//             data.id = entity.key.id;
//             debug('data after save:', data);
//             callback(err, err ? null : data.id);
//         }
//     );
// };
//
// /**
//  * Save the model instance for the given data
//  * @param {String} model The model name
//  * @param {Object} data The model data
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.save = function (model, data, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('save', model, data);
//     }
//     var idValue = self.getIdValue(model, data);
//     var idName = self.idName(model);
//
//     var oid = self.coerceId(model, idValue);
//     data._id = oid;
//     idName !== '_id' && delete data[idName];
//
//     data = self.toDatabase(model, data);
//
//     this.execute(model, 'save', data, {w: 1}, function (err, result) {
//         if (!err) {
//             self.setIdValue(model, data, idValue);
//             idName !== '_id' && delete data._id;
//         }
//         if (self.debug) {
//             debug('save.callback', model, err, result);
//         }
//
//         var info = {};
//         if (result && result.result) {
//             // create result formats:
//             //   { ok: 1, n: 1, upserted: [ [Object] ] }
//             //   { ok: 1, nModified: 0, n: 1, upserted: [ [Object] ] }
//             //
//             // update result formats:
//             //   { ok: 1, n: 1 }
//             //   { ok: 1, nModified: 1, n: 1 }
//             if (result.result.ok === 1 && result.result.n === 1) {
//                 info.isNewInstance = !!result.result.upserted;
//             } else {
//                 debug('save result format not recognized: %j', result.result);
//             }
//         }
//
//         callback && callback(err, result && result.ops, info);
//     });
// };
//
// /**
//  * Check if a model instance exists by id
//  * @param {String} model The model name
//  * @param {*} id The id value
//  * @param {Function} [callback] The callback function
//  *
//  */
// GcDatastore.prototype.exists = function (model, id, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('exists', model, id);
//     }
//     id = self.coerceId(model, id);
//     this.execute(model, 'findOne', {_id: id}, function (err, data) {
//         if (self.debug) {
//             debug('exists.callback', model, id, err, data);
//         }
//         callback(err, !!(!err && data));
//     });
// };
//
// /**
//  * Find a model instance by id
//  * @param {String} model The model name
//  * @param {*} id The id value
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.find = function find(model, id, options, callback) {
//     debug('GcDatastore.prototype.find', model, id);
//     var self = this;
//     if (self.debug) {
//         debug('find', model, id);
//     }
//     var idName = self.idName(model);
//     var oid = self.coerceId(model, id);
//     this.execute(model, 'findOne', {_id: oid}, function (err, data) {
//         if (self.debug) {
//             //debug('find.callback', model, id, err, data);
//         }
//
//         data = self.fromDatabase(model, data);
//         data && idName !== '_id' && delete data._id;
//         callback && callback(err, data);
//     });
// };
//
// /**
//  * Parses the data input for update operations and returns the
//  * sanitised version of the object.
//  *
//  * @param data
//  * @returns {*}
//  */
// GcDatastore.prototype.parseUpdateData = function (model, data, options) {
//     options = options || {};
//     var parsedData = {};
//
//     var modelClass = this._models[model];
//
//     var allowExtendedOperators = this.settings.allowExtendedOperators;
//     if (options.hasOwnProperty('allowExtendedOperators')) {
//         allowExtendedOperators = options.allowExtendedOperators === true;
//     } else if (allowExtendedOperators !== false && modelClass.settings.mongodb &&
//         modelClass.settings.mongodb.hasOwnProperty('allowExtendedOperators')) {
//         allowExtendedOperators = modelClass.settings.mongodb.allowExtendedOperators === true;
//     } else if (allowExtendedOperators === true) {
//         allowExtendedOperators = true;
//     }
//
//     if (allowExtendedOperators) {
//         // Check for other operators and sanitize the data obj
//         var acceptedOperators = [
//             // Field operators
//             '$currentDate', '$inc', '$max', '$min', '$mul', '$rename', '$setOnInsert', '$set', '$unset',
//             // Array operators
//             '$addToSet', '$pop', '$pullAll', '$pull', '$pushAll', '$push',
//             // Bitwise operator
//             '$bit',
//         ];
//
//         var usedOperators = 0;
//
//         // each accepted operator will take its place on parsedData if defined
//         for (var i = 0; i < acceptedOperators.length; i++) {
//             if (data[acceptedOperators[i]]) {
//                 parsedData[acceptedOperators[i]] = data[acceptedOperators[i]];
//                 usedOperators++;
//             }
//         }
//
//         // if parsedData is still empty, then we fallback to $set operator
//         if (usedOperators === 0) {
//             parsedData.$set = data;
//         }
//     } else {
//         parsedData.$set = data;
//     }
//
//     return parsedData;
// };
//
// /**
//  * Update if the model instance exists with the same id or create a new instance
//  *
//  * @param {String} model The model name
//  * @param {Object} data The model instance data
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.updateOrCreate = function updateOrCreate(model, data, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('updateOrCreate', model, data);
//     }
//
//     var kind = model;
//     var key;
//     var id = data.id;
//     if (id) {
//         key = ds.key([kind, parseInt(id, 10)]);
//     } else {
//         key = ds.key(kind);
//     }
//
//
//     const entity = {
//         key: key,
//         data: toDatastore(data, ['description'])
//     };
//     debug('create data ready', model, entity);
//     ds.save(
//         entity,
//         function (err) {
//             data.id = entity.key.id;
//             callback(err, err ? null : data);
//         }
//     );
//
//
//     // var id = self.getIdValue(model, data);
//     // var idName = self.idName(model);
//     // var oid = self.coerceId(model, id);
//     // delete data[idName];
//     //
//     // data = self.toDatabase(model, data);
//     //
//     // // Check for other operators and sanitize the data obj
//     // data = self.parseUpdateData(model, data, options);
//     //
//     // this.execute(model, 'findAndModify', {
//     //     _id: oid,
//     // }, [
//     //     ['_id', 'asc'],
//     // ], data, {upsert: true, new: true}, function (err, result) {
//     //     if (self.debug) {
//     //         debug('updateOrCreate.callback', model, id, err, result);
//     //     }
//     //     var object = result && result.value;
//     //     if (!err && !object) {
//     //         // No result
//     //         err = 'No ' + model + ' found for id ' + id;
//     //     }
//     //     if (!err) {
//     //         self.setIdValue(model, object, oid);
//     //         object && idName !== '_id' && delete object._id;
//     //     }
//     //
//     //     var info;
//     //     if (result && result.lastErrorObject) {
//     //         info = {isNewInstance: !result.lastErrorObject.updatedExisting};
//     //     } else {
//     //         debug('updateOrCreate result format not recognized: %j', result);
//     //     }
//     //
//     //     callback && callback(err, object, info);
//     // });
// };
//
// /**
//  * Replace model instance if it exists or create a new one if it doesn't
//  *
//  * @param {String} model The name of the model
//  * @param {Object} data The model instance data
//  * @param {Object} options The options object
//  * @param {Function} [cb] The callback function
//  */
// GcDatastore.prototype.replaceOrCreate = function (model, data, options, cb) {
//     if (this.debug) debug('replaceOrCreate', model, data);
//
//     var id = this.getIdValue(model, data);
//     var oid = this.coerceId(model, id);
//     var idName = this.idName(model);
//     data._id = data[idName];
//     delete data[idName];
//     this.replaceWithOptions(model, oid, data, {upsert: true}, cb);
// };
//
// /**
//  * Delete a model instance by id
//  * @param {String} model The model name
//  * @param {*} id The id value
//  * @param [callback] The callback function
//  */
// GcDatastore.prototype.destroy = function destroy(model, id, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('delete', model, id);
//     }
//     id = self.coerceId(model, id);
//     this.execute(model, 'remove', {_id: id}, function (err, result) {
//         if (self.debug) {
//             debug('delete.callback', model, id, err, result);
//         }
//         var res = result && result.result;
//         if (res) {
//             res.count = res.n;
//         }
//         callback && callback(err, res);
//     });
// };
//
// /*!
//  * Decide if id should be included
//  * @param {Object} fields
//  * @returns {Boolean}
//  * @private
//  */
// function idIncluded(fields, idName) {
//     if (!fields) {
//         return true;
//     }
//     if (Array.isArray(fields)) {
//         return fields.indexOf(idName) >= 0;
//     }
//     if (fields[idName]) {
//         // Included
//         return true;
//     }
//     if ((idName in fields) && !fields[idName]) {
//         // Excluded
//         return false;
//     }
//     for (var f in fields) {
//         return !fields[f]; // If the fields has exclusion
//     }
//     return true;
// }
//
// GcDatastore.prototype.buildWhere = function (model, where) {
//     var self = this;
//     var query = {};
//     if (where === null || (typeof where !== 'object')) {
//         return query;
//     }
//     var idName = self.idName(model);
//     Object.keys(where).forEach(function (k) {
//         var cond = where[k];
//         if (k === 'and' || k === 'or' || k === 'nor') {
//             if (Array.isArray(cond)) {
//                 cond = cond.map(function (c) {
//                     return self.buildWhere(model, c);
//                 });
//             }
//             query['$' + k] = cond;
//             delete query[k];
//             return;
//         }
//         if (k === idName) {
//             k = '_id';
//         }
//         var propName = k;
//         if (k === '_id') {
//             propName = idName;
//         }
//         var prop = self.getPropertyDefinition(model, propName);
//
//         var spec = false;
//         var options = null;
//         if (cond && cond.constructor.name === 'Object') {
//             options = cond.options;
//             spec = Object.keys(cond)[0];
//             cond = cond[spec];
//         }
//         if (spec) {
//             if (spec === 'between') {
//                 query[k] = {$gte: cond[0], $lte: cond[1]};
//             } else if (spec === 'inq') {
//                 query[k] = {
//                     $in: cond.map(function (x) {
//                         if ('string' !== typeof x) return x;
//                         return ObjectID(x);
//                     }),
//                 };
//             } else if (spec === 'nin') {
//                 query[k] = {
//                     $nin: cond.map(function (x) {
//                         if ('string' !== typeof x) return x;
//                         return ObjectID(x);
//                     }),
//                 };
//             } else if (spec === 'like') {
//                 query[k] = {$regex: new RegExp(cond, options)};
//             } else if (spec === 'nlike') {
//                 query[k] = {$not: new RegExp(cond, options)};
//             } else if (spec === 'neq') {
//                 query[k] = {$ne: cond};
//             } else if (spec === 'regexp') {
//                 if (cond.global)
//                     g.warn('{{GcDatastore}} regex syntax does not respect the {{`g`}} flag');
//
//                 query[k] = {$regex: cond};
//             } else {
//                 query[k] = {};
//                 query[k]['$' + spec] = cond;
//             }
//         } else {
//             if (cond === null) {
//                 // http://docs.mongodb.org/manual/reference/operator/query/type/
//                 // Null: 10
//                 query[k] = {$type: 10};
//             } else {
//                 query[k] = cond;
//             }
//         }
//     });
//     return query;
// };
//
// GcDatastore.prototype.buildSort = function (model, order) {
//     var sort = {};
//     var idName = this.idName(model);
//     if (!order) {
//         var idNames = this.idNames(model);
//         if (idNames && idNames.length) {
//             order = idNames;
//         }
//     }
//     if (order) {
//         var keys = order;
//         if (typeof keys === 'string') {
//             keys = keys.split(',');
//         }
//         for (var index = 0, len = keys.length; index < len; index++) {
//             var m = keys[index].match(/\s+(A|DE)SC$/);
//             var key = keys[index];
//             key = key.replace(/\s+(A|DE)SC$/, '').trim();
//             if (key === idName) {
//                 key = '_id';
//             }
//             if (m && m[1] === 'DE') {
//                 sort[key] = -1;
//             } else {
//                 sort[key] = 1;
//             }
//         }
//     } else {
//         // order by _id by default
//         sort = {_id: 1};
//     }
//     return sort;
// };
//
// function convertToMeters(distance, unit) {
//     switch (unit) {
//         case 'meters':
//             return distance;
//         case 'kilometers':
//             return distance * 1000;
//         case 'miles':
//             return distance * 1600;
//         case 'feet':
//             return distance * 0.3048;
//         default:
//             console.warn('unsupported unit ' + unit + ', fallback to mongodb default unit \'meters\'');
//             return distance;
//     }
// }
//
// function buildNearFilter(query, near) {
//     var coordinates = {};
//     if (typeof near.near === 'string') {
//         var s = near.near.split(',');
//         coordinates.lng = Number(s[0]);
//         coordinates.lat = Number(s[1]);
//     } else {
//         coordinates = near.near;
//     }
//
//     query.where[near.key] = {
//         near: {
//             $geometry: {
//                 coordinates: [coordinates.lng, coordinates.lat],
//                 type: 'Point',
//             },
//         },
//     };
//
//     var props = ['maxDistance', 'minDistance'];
//     //use mongodb default unit 'meters' rather than 'miles'
//     var unit = near.unit || 'meters';
//     props.forEach(function (p) {
//         if (near[p]) {
//             query.where[near.key]['near']['$' + p] = convertToMeters(near[p], unit);
//         }
//     });
// };
//
// function hasNearFilter(where) {
//     if (!where) return false;
//
//     for (var k in where) {
//         if (where[k] && typeof where[k] === 'object' && where[k].near) {
//             return true;
//         }
//     }
//
//     return false;
// }
//
// /**
//  * Find matching model instances by the filter
//  *
//  * @param {String} model The model name
//  * @param {Object} filter The filter
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.all = function all(model, filter, options, callback) {
//
//     debug('GcDatastore.prototype.all')
//     var self = this;
//     if (self.debug) {
//         debug('all', model, filter);
//     }
//
//     const q = ds.createQuery([model]);
//
//     ds.runQuery(q, function (err, entities, nextQuery) {
//         if (err) {
//             return callback(err);
//         }
//
//         debug('entities', JSON.stringify(entities[0]))
//         const hasMore = nextQuery.moreResults !== gcDatastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
//         //callback(null, entities.map(fromDatastore), hasMore);
//         callback(null, entities, hasMore);
//     });
//
//
//     //
//     // filter = filter || {};
//     // var idName = self.idName(model);
//     // var query = {};
//     // if (filter.where) {
//     //     if (filter.where[idName]) {
//     //         var id = filter.where[idName];
//     //         delete filter.where[idName];
//     //         if (id.constructor !== Object) {
//     //             // {id: value}
//     //             id = self.coerceId(model, id);
//     //         }
//     //         filter.where._id = id;
//     //     }
//     //     query = self.buildWhere(model, filter.where);
//     // }
//     // var fields = filter.fields;
//     // if (fields) {
//     //     this.execute(model, 'find', query, fields, processResponse);
//     // } else {
//     //     this.execute(model, 'find', query, processResponse);
//     // }
//     //
//     // function processResponse(err, cursor) {
//     //     if (err) {
//     //         return callback(err);
//     //     }
//     //     var order = {};
//     //
//     //     // don't apply sorting if dealing with a geo query
//     //     if (!hasNearFilter(filter.where)) {
//     //         if (!filter.order) {
//     //             var idNames = self.idNames(model);
//     //             if (idNames && idNames.length) {
//     //                 filter.order = idNames;
//     //             }
//     //         }
//     //         if (filter.order) {
//     //             var keys = filter.order;
//     //             if (typeof keys === 'string') {
//     //                 keys = keys.split(',');
//     //             }
//     //             for (var index = 0, len = keys.length; index < len; index++) {
//     //                 var m = keys[index].match(/\s+(A|DE)SC$/);
//     //                 var key = keys[index];
//     //                 key = key.replace(/\s+(A|DE)SC$/, '').trim();
//     //                 if (key === idName) {
//     //                     key = '_id';
//     //                 }
//     //                 if (m && m[1] === 'DE') {
//     //                     order[key] = -1;
//     //                 } else {
//     //                     order[key] = 1;
//     //                 }
//     //             }
//     //         } else {
//     //             // order by _id by default
//     //             order = {_id: 1};
//     //         }
//     //         cursor.sort(order);
//     //     }
//     //
//     //     if (filter.limit) {
//     //         cursor.limit(filter.limit);
//     //     }
//     //     if (filter.skip) {
//     //         cursor.skip(filter.skip);
//     //     } else if (filter.offset) {
//     //         cursor.skip(filter.offset);
//     //     }
//     //     cursor.toArray(function (err, data) {
//     //         if (self.debug) {
//     //             debug('all', model, filter, err, data);
//     //         }
//     //         if (err) {
//     //             return callback(err);
//     //         }
//     //         var objs = data.map(function (o) {
//     //             if (idIncluded(fields, self.idName(model))) {
//     //                 self.setIdValue(model, o, o._id);
//     //             }
//     //             // Don't pass back _id if the fields is set
//     //             if (fields || idName !== '_id') {
//     //                 delete o._id;
//     //             }
//     //             o = self.fromDatabase(model, o);
//     //             return o;
//     //         });
//     //         if (filter && filter.include) {
//     //             self._models[model].model.include(objs, filter.include, options, callback);
//     //         } else {
//     //             callback(null, objs);
//     //         }
//     //     });
//     // }
// };
//
// /**
//  * Delete all instances for the given model
//  * @param {String} model The model name
//  * @param {Object} [where] The filter for where
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.destroyAll = function destroyAll(model, where, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('destroyAll', model, where);
//     }
//     if (!callback && 'function' === typeof where) {
//         callback = where;
//         where = undefined;
//     }
//     where = self.buildWhere(model, where);
//     this.execute(model, 'remove', where || {}, function (err, info) {
//         if (err) return callback && callback(err);
//
//         if (self.debug)
//             debug('destroyAll.callback', model, where, err, info);
//
//         var affectedCount = info.result ? info.result.n : undefined;
//
//         callback && callback(err, {count: affectedCount});
//     });
// };
//
// /**
//  * Count the number of instances for the given model
//  *
//  * @param {String} model The model name
//  * @param {Function} [callback] The callback function
//  * @param {Object} filter The filter for where
//  *
//  */
// GcDatastore.prototype.count = function count(model, where, options, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('count', model, where);
//     }
//     where = self.buildWhere(model, where);
//     this.execute(model, 'count', where, function (err, count) {
//         if (self.debug) {
//             debug('count.callback', model, err, count);
//         }
//         callback && callback(err, count);
//     });
// };
//
// /**
//  * Replace properties for the model instance data
//  * @param {String} model The name of the model
//  * @param {*} id The instance id
//  * @param {Object} data The model data
//  * @param {Object} options The options object
//  * @param {Function} [cb] The callback function
//  */
// GcDatastore.prototype.replaceById = function replace(model, id, data, options, cb) {
//     if (this.debug) debug('GcDatastore.prototype.replaceById', model, id, data);
//
//     //var oid = this.coerceId(model, id);
//     // this.replaceWithOptions(model, oid, data, {upsert: false}, function (err, data) {
//     //     cb(err, data);
//     // });
// };
//
// /**
//  * Update a model instance with id
//  * @param {String} model The name of the model
//  * @param {Object} id The id of the model instance
//  * @param {Object} data The property/value pairs to be updated or inserted if {upsert: true} is passed as options
//  * @param {Object} options The options you want to pass for update, e.g, {upsert: true}
//  * @callback {Function} [cb] Callback function
//  */
// GcDatastore.prototype.replaceWithOptions = function (model, id, data, options, cb) {
//     var self = this;
//
//
//     this.execute(model, 'update', {_id: id}, data, options, function (err, info) {
//         if (this.debug) debug('updateWithOptions.callback', model, {_id: id}, data, err, info);
//         if (err)  return cb && cb(err);
//         var result;
//         var cbInfo = {};
//         if (info.result && info.result.n == 1) {
//             result = data;
//             delete result._id;
//             var idName = self.idName(model);
//             result[idName] = id;
//             // create result formats:
//             //   2.4.x :{ ok: 1, n: 1, upserted: [ Object ] }
//             //   { ok: 1, nModified: 0, n: 1, upserted: [ Object ] }
//             //
//             // replace result formats:
//             //   2.4.x: { ok: 1, n: 1 }
//             //   { ok: 1, nModified: 1, n: 1 }
//             if (info.result.nModified !== undefined) {
//                 cbInfo.isNewInstance = info.result.nModified === 0;
//             }
//         } else {
//             result = undefined;
//         }
//         cb && cb(err, result, cbInfo);
//     });
// };
//
// /**
//  * Update properties for the model instance data
//  * @param {String} model The model name
//  * @param {Object} data The model data
//  * @param {Function} [callback] The callback function
//  */
// GcDatastore.prototype.updateAttributes = function updateAttrs(model, id, data, options, cb) {
//     var self = this;
//
//     // Check for other operators and sanitize the data obj
//     data = self.parseUpdateData(model, data, options);
//
//     if (self.debug) {
//         debug('updateAttributes', model, id, data);
//     }
//     var oid = self.coerceId(model, id);
//     var idName = this.idName(model);
//
//
//     data = self.toDatabase(model, data);
//
//     this.execute(model, 'findAndModify', {_id: oid}, [
//         ['_id', 'asc'],
//     ], data, {}, function (err, result) {
//         if (self.debug) {
//             debug('updateAttributes.callback', model, id, err, result);
//         }
//         var object = result && result.value;
//         if (!err && !object) {
//             // No result
//             err = 'No ' + model + ' found for id ' + id;
//         }
//         self.setIdValue(model, object, id);
//         object && idName !== '_id' && delete object._id;
//         cb && cb(err, object);
//     });
// };
//
// /**
//  * Update all matching instances
//  * @param {String} model The model name
//  * @param {Object} where The search criteria
//  * @param {Object} data The property/value pairs to be updated
//  * @callback {Function} cb Callback function
//  */
// GcDatastore.prototype.update =
//     GcDatastore.prototype.updateAll = function updateAll(model, where, data, options, cb) {
//         var self = this;
//         if (self.debug) {
//             debug('updateAll', model, where, data);
//         }
//         var idName = this.idName(model);
//
//         where = self.buildWhere(model, where);
//         delete data[idName];
//
//         data = self.toDatabase(model, data);
//
//         // Check for other operators and sanitize the data obj
//         data = self.parseUpdateData(model, data, options);
//
//         this.execute(model, 'update', where, data, {multi: true, upsert: false},
//             function (err, info) {
//                 if (err) return cb && cb(err);
//
//                 if (self.debug)
//                     debug('updateAll.callback', model, where, data, err, info);
//
//                 var affectedCount = info.result ? info.result.n : undefined;
//
//                 cb && cb(err, {count: affectedCount});
//             });
//     };
//
// /**
//  * Disconnect from GcDatastore
//  */
// GcDatastore.prototype.disconnect = function (cb) {
//     if (this.debug) {
//         debug('disconnect');
//     }
//     if (this.db) {
//         this.db.close();
//     }
//     if (cb) {
//         process.nextTick(cb);
//     }
// };
//
// /**
//  * Perform autoupdate for the given models. It basically calls createIndex
//  * @param {String[]} [models] A model name or an array of model names. If not
//  * present, apply to all models
//  * @param {Function} [cb] The callback function
//  */
// GcDatastore.prototype.autoupdate = function (models, cb) {
//     var self = this;
//     if (self.db) {
//         if (self.debug) {
//             debug('autoupdate');
//         }
//         if ((!cb) && ('function' === typeof models)) {
//             cb = models;
//             models = undefined;
//         }
//         // First argument is a model name
//         if ('string' === typeof models) {
//             models = [models];
//         }
//
//         models = models || Object.keys(self._models);
//
//         async.each(models, function (model, modelCallback) {
//             var indexes = self._models[model].settings.indexes || [];
//             var indexList = [];
//             var index = {};
//             var options = {};
//
//             if (typeof indexes === 'object') {
//                 for (var indexName in indexes) {
//                     index = indexes[indexName];
//                     if (index.keys) {
//                         // The index object has keys
//                         options = index.options || {};
//                         options.name = options.name || indexName;
//                         index.options = options;
//                     } else {
//                         options = {name: indexName};
//                         index = {
//                             keys: index,
//                             options: options,
//                         };
//                     }
//                     indexList.push(index);
//                 }
//             } else if (Array.isArray(indexes)) {
//                 indexList = indexList.concat(indexes);
//             }
//             var properties = self._models[model].properties;
//             /* eslint-disable one-var */
//             for (var p in properties) {
//                 if (properties[p].index) {
//                     index = {};
//                     index[p] = 1; // Add the index key
//                     if (typeof properties[p].index === 'object') {
//                         // If there is a mongodb key for the index, use it
//                         if (typeof properties[p].index.mongodb === 'object') {
//                             options = properties[p].index.mongodb;
//                             index[p] = options.kind || 1;
//
//                             // Backwards compatibility for former type of indexes
//                             if (properties[p].index.unique === true) {
//                                 options.unique = true;
//                             }
//                         } else {
//                             // If there isn't an  properties[p].index.mongodb object, we read the properties from  properties[p].index
//                             options = properties[p].index;
//                         }
//
//                         if (options.background === undefined) {
//                             options.background = true;
//                         }
//                     } else if (properties[p].type && properties[p].type.name === 'GeoPoint') {
//                         var indexType = typeof properties[p].index === 'string' ?
//                             properties[p].index : '2dsphere';
//                         // If properties[p].index isn't an object we hardcode the background option and check for properties[p].unique
//                         options.name = 'index' + indexType + p;
//
//                         index[p] = indexType;
//                         indexList.push({keys: index, options: options});
//                     } else {
//                         options = {background: true};
//                         if (properties[p].unique) {
//                             options.unique = true;
//                         }
//                     }
//                     indexList.push({keys: index, options: options});
//                 }
//             }
//             /* eslint-enable one-var */
//
//             if (self.debug) {
//                 debug('create indexes: ', indexList);
//             }
//
//             async.each(indexList, function (index, indexCallback) {
//                 if (self.debug) {
//                     debug('createIndex: ', index);
//                 }
//                 self.collection(model).createIndex(index.fields || index.keys, index.options, indexCallback);
//             }, modelCallback);
//         }, cb);
//     } else {
//         self.dataSource.once('connected', function () {
//             self.autoupdate(models, cb);
//         });
//     }
// };
//
// /**
//  * Perform automigrate for the given models. It drops the corresponding collections
//  * and calls createIndex
//  * @param {String[]} [models] A model name or an array of model names. If not present, apply to all models
//  * @param {Function} [cb] The callback function
//  */
// GcDatastore.prototype.automigrate = function (models, cb) {
//     var self = this;
//     if (self.db) {
//         if (self.debug) {
//             debug('automigrate');
//         }
//         if ((!cb) && ('function' === typeof models)) {
//             cb = models;
//             models = undefined;
//         }
//         // First argument is a model name
//         if ('string' === typeof models) {
//             models = [models];
//         }
//
//         models = models || Object.keys(self._models);
//
//         // Make it serial as multiple models might map to the same collection
//         async.eachSeries(models, function (model, modelCallback) {
//             var collectionName = self.collectionName(model);
//             if (self.debug) {
//                 debug('drop collection %s for model %s', collectionName, model);
//             }
//
//             self.db.dropCollection(collectionName, function (err, collection) {
//                 if (err) {
//                     debug('Error dropping collection %s for model %s: ', collectionName, model, err);
//                     if (!(err.name === 'MongoError' && err.ok === 0 &&
//                         err.errmsg === 'ns not found')) {
//                         // For errors other than 'ns not found' (collection doesn't exist)
//                         return modelCallback(err);
//                     }
//                 }
//                 // Recreate the collection
//                 if (self.debug) {
//                     debug('create collection %s for model %s', collectionName, model);
//                 }
//                 self.db.createCollection(collectionName, modelCallback);
//             });
//         }, function (err) {
//             if (err) {
//                 return cb && cb(err);
//             }
//             self.autoupdate(models, cb);
//         });
//     } else {
//         self.dataSource.once('connected', function () {
//             self.automigrate(models, cb);
//         });
//     }
// };
//
// GcDatastore.prototype.ping = function (cb) {
//     var self = this;
//     if (self.db) {
//         this.db.collection('dummy').findOne({_id: 1}, cb);
//     } else {
//         self.dataSource.once('connected', function () {
//             self.ping(cb);
//         });
//         self.dataSource.once('error', function (err) {
//             cb(err);
//         });
//         self.connect(function () {
//         });
//     }
// };
//
// /**
//  * Find a matching model instances by the filter or create a new instance
//  *
//  * Only supported on mongodb 2.6+
//  *
//  * @param {String} model The model name
//  * @param {Object} data The model instance data
//  * @param {Object} filter The filter
//  * @param {Function} [callback] The callback function
//  */
// function optimizedFindOrCreate(model, filter, data, callback) {
//     var self = this;
//     if (self.debug) {
//         debug('findOrCreate', model, filter, data);
//     }
//
//     var idValue = self.getIdValue(model, data);
//     var idName = self.idName(model);
//
//     if (idValue == null) {
//         delete data[idName]; // Allow GcDatastore to generate the id
//     } else {
//         var oid = self.coerceId(model, idValue); // Is it an Object ID?
//         data._id = oid; // Set it to _id
//         idName !== '_id' && delete data[idName];
//     }
//
//     filter = filter || {};
//     var query = {};
//     if (filter.where) {
//         if (filter.where[idName]) {
//             var id = filter.where[idName];
//             delete filter.where[idName];
//             id = self.coerceId(model, id);
//             filter.where._id = id;
//         }
//         query = self.buildWhere(model, filter.where);
//     }
//
//     var sort = self.buildSort(model, filter.order);
//
//     this.collection(model).findOneAndUpdate(
//         query,
//         {$setOnInsert: data},
//         {projection: filter.fields, sort: sort, upsert: true},
//         function (err, result) {
//             if (self.debug) {
//                 debug('findOrCreate.callback', model, filter, err, result);
//             }
//             if (err) {
//                 return callback(err);
//             }
//
//             var value = result.value;
//             var created = !!result.lastErrorObject.upserted;
//
//             if (created && (value == null || Object.keys(value).length == 0)) {
//                 value = data;
//                 self.setIdValue(model, value, result.lastErrorObject.upserted);
//             } else {
//                 value = self.fromDatabase(model, value);
//                 self.setIdValue(model, value, value._id);
//             }
//
//             value && idName !== '_id' && delete value._id;
//
//             if (filter && filter.include) {
//                 self._models[model].model.include([value], filter.include, function (err, data) {
//                     callback(err, data[0], created);
//                 });
//             } else {
//                 callback(null, value, created);
//             }
//         });
// };


//transaction example
// const transaction = datastore.transaction();
// const taskKey = datastore.key([
//   'Task',
//   taskId
// ]);
//
// return transaction.run()
//     .then(() => transaction.get(taskKey))
// .then((results) => {
//   const task = results[0];
// task.done = true;
// transaction.save({
//   key: taskKey,
//   data: task
// });
// return transaction.commit();
// })
// .then(() => {
//   // The transaction completed successfully.
//   console.log(`Task ${taskId} updated successfully.`);
// })
// .catch(() => transaction.rollback());
