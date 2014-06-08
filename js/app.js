App = Ember.Application.create();

App.Router.map(function() {
  this.resource('games', function() {
    this.resource('game', { path: ':game_id' });
  });
  this.resource('sessions', function() {
    this.resource('session', { path: ':session_id' });
    this.route('new');
  });
  this.resource('players', function() {
    this.resource('player', { path: ':player_id' });
  });
});

App.GamesRoute = Ember.Route.extend({
  model: function() {
    return $.getJSON('http://localhost:8080/collection').then(function(data) {
      var i = 0;
      collection = data.Games.map(function(game) {
        var g = {};
        i += 1;
        g.id = i.toString();
        // Translate from serialized golang public fields
        g.name = game.Name
        return g;
      });
      return collection;
    });
  }
});

App.GameRoute = Ember.Route.extend({
  model: function(params) {
    return collection.findBy('id', params.game_id);
  }
});

App.SessionsRoute = Ember.Route.extend({
  model: function() {
    return sessions;
  }
});

App.PlayersRoute = Ember.Route.extend({
  model: function() {
    return $.getJSON('http://localhost:8080/players').then(function(data) {
      players = data.map(function(player) {
        var p = {};
        // Translate from serialized golang public fields
        p.id = player.Id.toString();
        p.name = player.Name
        return p;
      });
      return players;
    });
  }
});

App.PlayerRoute = Ember.Route.extend({
  model: function(params) {
    return players.findBy('id', params.player_id);
  }
});

App.PlayerController = Ember.ObjectController.extend({
  isEditing: false,

  actions: {
    edit: function() {
      this.set('isEditing', true);
    },
    doneEditing: function() {
      this.set('isEditing', false);
    }
  }
});

var collection = [
  { id: 1, name: "Dungeon Lords" },
  { id: 2, name: "7 Wonders" },
];

App.SessionsNewController = Ember.ObjectController.extend({
  games: collection,

  actions: {
    create: function() {
      var game = this.get('game')
      sessions.push({
        id: 43,
        game_id: game.id,
        started_date: new Date(),
      });
    }
  }
});

var players = {};

var sessions = [
  {
    id: 1,
    game_id: 1,
    started_date: new Date(2014, 6, 6, 20, 20, 20, 0),
  }
];
