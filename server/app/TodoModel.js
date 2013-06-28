define(["node-uuid", "Deferred", "when", "di/redisClient"], function (uuid, Deferred, when, db) {
  "use strict";

  var collectionKey = "TodoModel";

  /**
   *
   * @constructor
   */
  var self = function TodoModel() {

  };

  /**
   *
   * @param functions
   * @returns {*}
   */
  function doSync(functions) {
    return when.apply(null, functions.map(function (func) {
      var df = Deferred();
      func(function (err, res) {
        err ? df.rejectWith(this, [err]) : df.resolveWith(this, [res]);
      });
      return df.promise();
    }, this));
  }

  /**
   *
   * @param callback
   */
  self.find = function (callback) {
    var collection, res = {};
    Deferred().resolve()
      .pipe(function () {
        var df = Deferred();
        db.lrange(collectionKey, 0, -1, function (err, res) {
          err ? df.reject(err) : df.resolve(res);
        });
        return df.promise();
      })
      .pipe(function (ids) {
        collection = ids;
        return when.apply(null, ids.map(function (id) {
          return doSync([
            db.hget.bind(db, id, "title"),
            db.hget.bind(db, id, "completed")
          ])
            .done(function (title, completed) {
              res[id] = {
                id:        id,
                title:     title,
                completed: completed === "true"
              }
            });
        }));
      })
      .done(function () {
        callback(null, collection.map(function (id) {
          return res[id];
        }));
      })
      .fail(function (err) {
        callback(err);
      });
  };

  /**
   *
   * @param id
   * @param callback
   */
  self.findOne = function (id, callback) {
    doSync([
      db.hget.bind(db, id, "title"),
      db.hget.bind(db, id, "completed")
    ])
      .done(function (title, completed) {
        callback(null, {
          id:        id,
          title:     title,
          completed: completed === "true"
        });
      })
      .fail(function (err) {
        callback(err);
      });
  };

  /**
   *
   * @param title
   * @param callback
   */
  self.create = function (title, callback) {
    var id = uuid.v4();
    doSync([
      db.hset.bind(db, id, "title", title),
      db.hset.bind(db, id, "completed", false),
      db.rpush.bind(db, collectionKey, id)
    ])
      .done(function () {
        callback(null, id);
        db.publish("created", id);
      })
      .fail(function (err) {
        callback(err);
      });
   };

  /**
   *
   * @param id
   * @param field
   * @param value
   * @param callback
   */
  self.update = function (id, field, value, callback) {
    db.hset(id, field, value, function (err, res) {
      if (err) {
        callback(err);
      } else {
        callback(null, id);
        db.publish("updated", id);
      }
    });
  };

  /**
   *
   * @param id
   */
  self.remove = function (id, callback) {
    doSync([
      db.hdel.bind(db, id, "title"),
      db.hdel.bind(db, id, "completed"),
      db.lrem.bind(db, collectionKey, 1, id)
    ])
      .done(function () {
        callback(null, id);
        db.publish("removed", id);
      })
      .fail(function (err) {
        callback(err);
      });
  };

  return self;
});