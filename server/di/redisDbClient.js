define(["redis"], function (redis) {
  var client = redis.createClient();

  return client;
});