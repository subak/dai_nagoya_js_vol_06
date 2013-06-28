define(["/nowjs/now.js"], function() {
  "use strict";
  return {
    load: function (name, req, onload, config) {
      now.ready(function () {
        onload(now);
      });
    }
  }
});