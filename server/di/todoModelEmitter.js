define(["EventEmitter", "di/redisPubsubClient"], function (EventEmitter, pubsub) {
  var emitter = new EventEmitter;

  pubsub.subscribe("created");
  pubsub.subscribe("updated");
  pubsub.subscribe("removed");

  pubsub.on("message", function (type, id) {
    emitter.emit(type, id);
  });

  return emitter;
});