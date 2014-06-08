App = Ember.Application.create();

App.Router.map(function() {
  this.resource('games', function() {
    this.resource('game', { path: ':game_id' });
  });
  this.resource('sessions');
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
        g.id = i.toString();
        // Translate from serialized golang public fields
        g.name = game.Name
        return g;
      });
      return collection;
    });
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

App.GameController = Ember.ObjectController.extend({
  actions: {
    newSession: function() {

    }
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

var players = {};

var collection = [
  { name: "Dungeon Lords" },
  { name: "7 Wonders" },
];
