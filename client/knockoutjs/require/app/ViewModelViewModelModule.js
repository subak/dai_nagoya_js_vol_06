define([
  "knockout", "lib/TodoModel", "app/TodoViewModel", "di/todoModelEmitter"
], function (ko, TodoModel, TodoViewModel, emitter) {
  "use strict";

  var self = function ViewModelViewModelModule() {
    var self = this;
    this.waiting = ko.observable(false);

    this.add = function () {
      add.apply(self, arguments);
    };

    this.stopEditing = function () {
      stopEditing.apply(self, arguments);
    };

    this.remove = function () {
      remove.apply(self, arguments);
    };

    emitter.on("created", function () {
      created.apply(self, arguments);
    });

    emitter.on("updated", function () {
      updated.apply(self, arguments);
    });

    emitter.on("removed", function () {
      removed.apply(self, arguments);
    });
  };

  function remove(item) {
    var self = this;
    TodoModel.remove(item.id, function (err) {
      if (err) {

      }
    });
  }

  function removed(id) {
    var self = this,
      todos = ko.utils.arrayFilter(this.todos(), function (item) {
        return item.id === id;
      });
    ko.utils.arrayForEach(todos, function (item) {
      if (item.editing()) {
        alert("編集中に他のユーザーがこのアイテムを削除したため編集内容は破棄されます。");
      }
      self.todos.remove(item);
    });
    this.waiting(false);
  }

  function add() {
    var self = this,
      current = this.current().trim();

    if (current) {
      this.waiting(true);
      TodoModel.create(current, function (err) {
        if (err) {
          throw new Error;
        } else {
          self.current('');
        }
      });
    }
  }

  function created(id) {
    var self = this;
    TodoModel.findOne(id, function (err, model) {
      if (err) {
        throw new Error;
      } else {
        self.waiting(false);
        self.todos.push(new TodoViewModel(model.title, model.completed, model.id));
      }
    });
  }

  function stopEditing(item) {
    var self = this;

    if (!this.waiting()) {
      if (!item.title().trim()) {
        this.waiting(true);
        TodoModel.remove(item.id, function (err) {
          if (err) {
            throw new Error;
          }
        });
      } else if (item.title() !== item.orgTitle) {
        this.waiting(true);
        TodoModel.update(item.id, "title", item.title(), function (err) {
          if (err) {
            throw new Error;
          }
        });
      }
    }
  }

  function updated(id) {
    var self = this,
      todos = ko.utils.arrayFilter(this.todos(), function (item) {
        return item.id === id;
      });

    TodoModel.findOne(id, function (err, model) {
      if (err) {
        throw new Error;
      } else {
        ko.utils.arrayForEach(todos, function (item) {
          if (!self.waiting() && item.editing() && confirm("編集中に他のユーザーがこのアイテムを更新しました。無視して編集を続けますか？")) {
          } else {
            item.title(model.title);
            item.completed(model.completed);
            item.editing(false);
          }

          item.orgTitle = model.title;
          item.orgCompleted = model.completed;
        });
        self.waiting(false);
      }
    });
  }

  return self;
});