// in order to see the app running inside the QUnit runner
App.rootElement = '#ember-testing';

// Common test setup
App.setupForTesting();
App.injectTestHelpers();

// common QUnit module declaration
module("Integration tests", {
  setup: function() {
    // before each test, ensure the application is ready to run.
    Ember.run(App, App.advanceReadiness);
  },

  teardown: function() {
    // reset the application state between each test
    App.reset();
  }
});

test("load games", function() {
  visit("/games");

  andThen(function() {
    equal(find("div.game").length, 2, "Two games hard-coded");
  });
});

test("load sessions", function() {
  visit("/sessions");

  andThen(function() {
    equal(find("div.session").length, 2, "Two sessions hard-coded");
  });
});

test("load players", function() {
  visit("/players");

  andThen(function() {
    equal(find("div.player").length, 3, "Three players in the DB");
  });
});
