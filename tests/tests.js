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

// Fixtures

var jsonGame = {
  id: 1,
  name: "Tic-Tac-Toe",
  SetupRules: [
    {
    Id: 1,
    Description: "Draw 3x3 grid",
    Details: "",
    Arity: "Once",
    Dependencies: null
    },
    {
      Id: 2,
      Description: "Choose X or O",
      Details: "",
      Arity: "Each player",
      Dependencies: null
    }
  ],
  min_players: 2,
  max_players: 2
};

var jsonPlayers = [
  {
    id: 1,
    name: "Player One"
  },
  {
    id: 2,
    name: "Player Two"
  }
];

// Tests

test("load games", function() {
  var json = [jsonGame];
  $.mockjax({
    url: 'http://localhost:8080/games',
    dataType: 'json',
    responseText: json,
  });

  visit("/games");

  andThen(function() {
    equal(find("div.game").length, 1, "One game");
  });
});

test("load sessions", function() {
  var json = [
    {
      id: 131,
      Game: jsonGame,
      Players: jsonPlayers,
      SetupAssignments: {
        1: {
          Rule: {
            Id: 2,
            Description: "Choose X or O",
            Details: "",
            Arity: "Each player",
            Dependencies: null
          },
          Owner: {
            id: 1,
            name: "Player One"
          },
          Done: true
        }
      },
      SetupSteps: [],
    },
  ];

  $.mockjax({
    url: 'http://localhost:8080/sessions',
    dataType: 'json',
    responseText: json,
  });

  $.mockjax({
    url: 'http://localhost:8080/games/1',
    dataType: 'json',
    responseText: jsonGame,
  });

  visit("/sessions");

  andThen(function() {
    equal(find("a.active").text(), "Sessions");
    equal(find("div.session").length, 1, "One session");
  });
});

test("load players", function() {
  var json = jsonPlayers;
  $.mockjax({
    url: 'http://localhost:8080/players',
    dataType: 'json',
    responseText: json,
  });

  visit("/players");

  andThen(function() {
    equal(find("div.player").length, 2, "Two players");
  });
});
