App = Ember.Application.create();

App.Router.map(function() {
  this.resource('games');
  this.resource('players', function() {
    this.resource('player', { path: ':player_id' });
  });
});

App.PlayersRoute = Ember.Route.extend({
  model: function() {
    return players;
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

var players = [
{
  id: "1",
  name: "Player 1",
  bio: "Loves a red/white weenie deck and eats breakfast for breakfast"
}, {
  id: "2",
  name: "Player 2",
  bio: "Is actually Player 1, just sitting in that chair over there"
}
];
