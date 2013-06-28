/*global ko Router */
require(["knockout", "lib/ViewModelViewModel", "lib/TodoModel", "lib/ViewModelModule"], function (ko, ViewModel, TodoModel, ViewModelModule) {
	'use strict';

	var ENTER_KEY = 13;

	// a custom binding to handle the enter key (could go in a separate library)
	ko.bindingHandlers.enterKey = {
		init: function (element, valueAccessor, allBindingsAccessor, data) {
			var wrappedHandler, newValueAccessor;

			// wrap the handler with a check for the enter key
			wrappedHandler = function (data, event) {
				if (event.keyCode === ENTER_KEY) {
					valueAccessor().call(this, data, event);
				}
			};

			// create a valueAccessor with the options that we would want to pass to the event binding
			newValueAccessor = function () {
				return {
					keyup: wrappedHandler
				};
			};

			// call the real event binding's init function
			ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, data);
		}
	};

	// wrapper to hasfocus that also selects text and applies focus async
	ko.bindingHandlers.selectAndFocus = {
		init: function (element, valueAccessor, allBindingsAccessor) {
			ko.bindingHandlers.hasfocus.init(element, valueAccessor, allBindingsAccessor);
			ko.utils.registerEventHandler(element, 'focus', function () {
				element.focus();
			});
		},
		update: function (element, valueAccessor) {
			ko.utils.unwrapObservable(valueAccessor()); // for dependency
			// ensure that element is visible before trying to focus
			setTimeout(function () {
				ko.bindingHandlers.hasfocus.update(element, valueAccessor);
			}, 0);
		}
	};

	// bind a new instance of our view model to the page
	var viewModel = new ViewModel([]);
	ko.applyBindings(viewModel);

	// set up filter routing
	/*jshint newcap:false */
	Router({'/:filter': viewModel.showMode}).init();

  TodoModel.find(function (err, collection) {
    viewModel.replace(collection);
  });
});
