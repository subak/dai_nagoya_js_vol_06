define(["url", "redis"], function (url, redis) {
  var client, rtg;

  if (process.env.REDISTOGO_URL) {
    rtg = url.parse(process.env.REDISTOGO_URL);
    client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
  } else {
    client = redis.createClient();
  }

  return client;
});