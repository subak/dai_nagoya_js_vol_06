define(["knockout", "lib/TodoViewModel", "lib/TodoModel", "di/todoModelEmitter"], function (ko, TodoViewModel, TodoModel, emitter) {
  var self = function ViewModelModule() {
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
          item.title(model.title);
          item.completed(model.completed);
          item.orgTitle = model.title;
          item.orgCompleted = model.completed;
          item.editing(false);
        });
        self.waiting(false);
      }
    });
  }

  return self;
});