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
    return $.getJSON('http://localhost:8080/players').then(function(data) {
      players = data.map(function(player) {
        console.log(player);
        var p = {};
        // Translate from serialized golang public fields
        p.id = player.Id.toString();
        p.name = player.Name
        console.log(p);
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

var players = {};
