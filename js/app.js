App = Ember.Application.create();

App.Router.map(function() {
  this.resource('games');
  this.resource('players', function() {
    this.resource('player', { path: ':player_id' });
  });
});

App.PlayersRoute = Ember.Route.extend({
  model: function () {
    return players;
  }
});

var players = [
{
  id: 1,
  name: "Player 1",
  bio: "Loves a red/white weenie deck and eats breakfast for breakfast"
}, {
  id: 2,
  name: "Player 2",
  bio: "Is actually Player 1, just sitting in that chair over there"
}
];
