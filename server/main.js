var requirejs = require("requirejs");
requirejs.config({
  baseUrl: __dirname,
  paths: {
    "Deferred":     "lib/JQDeferred/Deferred",
    "when":         "lib/JQDeferred/when",
    "EventEmitter": "lib/EventEmitter"
  }
});

requirejs(["http", "st", "now", "app/TodoModel"], function (http, st, now, TodoModel) {
  "use strict";

  var  mount = st({
      path:  "client/knockoutjs",
      url:   "/",
      index: "index.html",
      cache: false
    }),
    httpServer = http.createServer(mount),
    everyone = now.initialize(httpServer, {
      socketio: {
        transports: ['xhr-polling', 'jsonp-polling']
      }
    });

  var Model = {};
  Object.keys(TodoModel).forEach(function (funcName) {
    Model[funcName] = this[funcName].bind(this);
  }, TodoModel);
  everyone.now.TodoModel = Model;

  httpServer.listen(process.env.PORT || 5000);
});
