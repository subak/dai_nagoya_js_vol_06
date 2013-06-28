var requirejs = require("requirejs");
requirejs.config({
  baseUrl: __dirname,
  paths: {
    "Deferred": "lib/JQDeferred/Deferred",
    "when":     "lib/JQDeferred/when"
  }
});

requirejs(["http", "st", "now", "lib/TodoModel"], function (http, st, now, TodoModel) {
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


//"use strict";
//
//var http = require("http"),
//  st = require("st"),
//  nowjs = require("now"),
//  mount = st({
//    path:  "client/knockoutjs",
//    url:   "/",
//    index: "index.html",
//    cache: false
//  }),
//  httpServer = http.createServer(mount),
//  everyone = nowjs.initialize(httpServer, {
//    socketio: {
//      transports: ['xhr-polling', 'jsonp-polling']
//    }
//  });
//
//httpServer.listen(process.env.PORT || 5000);
