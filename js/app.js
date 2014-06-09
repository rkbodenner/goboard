App = Ember.Application.create();

App.ApplicationAdapter = DS.FixtureAdapter.extend();

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
    return this.store.find('game');
  }
});

App.GameRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('game', params.game_id);
  }
});

App.SessionsRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('session');
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

App.GamesController = Ember.ArrayController.extend({

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
  needs: "games",
  games: Ember.computed.alias("controllers.games"),

  actions: {
    create: function() {
      var game = this.store.find('game', this.get('game').id);
      var session = this.store.createRecord('session', {
        started_date: new Date(),
      });
      session.set('game', game);
      session.save();
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

App.Game = DS.Model.extend({
  sessions: DS.hasMany('session'),
  name: DS.attr('string'),
});

App.Session = DS.Model.extend({
  game: DS.belongsTo('game'),
  started_date: DS.attr('date'),
});

App.Game.FIXTURES = collection;
App.Session.FIXTURES = sessions;
