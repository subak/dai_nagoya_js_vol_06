define(["knockout"], function (ko) {
  "use strict";

  // represent a single todo item
  var self = function TodoViewModel(title, completed, id) {
    this.title = ko.observable(title);
    this.completed = ko.observable(completed);
    this.editing = ko.observable(false);
    this.id = id;
    this.orgTitle = title;
    this.orgCompleted = completed;
  };

  return self;
});
