define(["node-uuid", "Deferred", "when", "di/redisClient"], function (uuid, Deferred, when, db) {
  var collectionKey = "TodoModel";

  var self = function TodoModel() {

  };

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
   * {
   *   "{id}": {
   *     "title": "{title}",
   *     "completed": []
   *   }
   * }
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
                completed: completed
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

  self.create = function (title, callback) {
    var id = uuid.v4();
    doSync([
      db.hset.bind(db, id, "title", title),
      db.hset.bind(db, id, "completed", false),
      db.rpush.bind(db, collectionKey, id)
    ])
      .done(function () {
        callback(null, id);
      })
      .fail(function (err) {
        callback(err);
      });
   };

  self.update = function (id, field, value, callback) {
    db.hset(id, field, value, function (err, res) {
      callback(err, res);
    });
  };

  self.remove = function (id) {
    doSync([
      db.hdel(id, "title"),
      db.hdel(id, "completed"),
      db.lrem(collectionKey, 1, id)
    ], callback);
  };

  return self;
});