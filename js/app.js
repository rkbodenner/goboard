App = Ember.Application.create();

App.Router.map(function() {
  this.resource('games');
  this.resource('players', function() {
    this.resource('player', { path: ':player_id' });
  });
});

App.PlayersRoute = Ember.Route.extend({
  model: function() {
    var i = 0;
    return $.getJSON('http://localhost:8080/').then(function(data) {
      players = data.Players.map(function(player) {
        i += 1;
        player = {
          id: i.toString(),
          name: player
        };
        return player;
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

var players = {};
