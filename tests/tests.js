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

var jsonSessions = [
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
  $.mockjax({
    url: 'http://localhost:8080/sessions',
    dataType: 'json',
    responseText: jsonSessions,
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

test("load session", function() {
  $.mockjax({
    url: 'http://localhost:8080/sessions',
    dataType: 'json',
    responseText: jsonSessions,
  });

  $.mockjax({
    url: 'http://localhost:8080/games/1',
    dataType: 'json',
    responseText: jsonGame,
  });

  $.mockjax({
    url: 'http://localhost:8080/players/1',
    dataType: 'json',
    responseText: jsonPlayers[0],
  });

  $.mockjax({
    url: 'http://localhost:8080/players/2',
    dataType: 'json',
    responseText: jsonPlayers[1],
  });

  visit("/sessions/131");

  andThen(function() {
    equal(find("ul.nav > li > a.active").text(), "Sessions");
    equal(find("div.session > p > a.active").text(), "131: Tic-Tac-Toe");
    equal(find("div.session").length, 1, "One session");
    equal(find("div.player").length, 2, "Two players");
  });
});

test("show player step", function() {
  $.mockjax({
    url: 'http://localhost:8080/sessions',
    dataType: 'json',
    responseText: jsonSessions,
  });

  $.mockjax({
    url: 'http://localhost:8080/games/1',
    dataType: 'json',
    responseText: jsonGame,
  });

  $.mockjax({
    url: 'http://localhost:8080/players/1',
    dataType: 'json',
    responseText: jsonPlayers[0],
  });

  $.mockjax({
    url: 'http://localhost:8080/players/2',
    dataType: 'json',
    responseText: jsonPlayers[1],
  });

  visit("/sessions/131/players/1/step");

  andThen(function() {
    equal(find("ul.nav > li > a.active").text(), "Sessions");
    equal(find("div.session > p > a.active").text(), "131: Tic-Tac-Toe");
    equal(find("div.player > p > a.active").text(), "Player One");
    equal(find("button").text(), "Next step");
    equal(find("div.session").length, 1, "One session");
    equal(find("div.player").length, 2, "Two players");
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
