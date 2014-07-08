App = Ember.Application.create();

App.MEEPLE_MOVER_URL = 'http://meeple-mover.herokuapp.com';
//App.MEEPLE_MOVER_URL = 'http://localhost:8080';

App.ApplicationAdapter = DS.RESTAdapter.extend({
  host: App.MEEPLE_MOVER_URL,
});

App.Router.map(function() {
  this.resource('games', function() {
    this.resource('game', { path: ':game_id' });
  });
  this.resource('sessions', function() {
    this.resource('session', { path: ':session_id' }, function() {
      this.resource('player', { path: '/players/:player_id' });
      this.route('step', { path: '/players/:player_id/step'});
    });
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

App.SessionStepRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  }
});

App.PlayersRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('player');
  }
});

App.PlayerRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  }
});


App.GamesController = Ember.ArrayController.extend();

App.SessionStepController = Ember.ObjectController.extend({
  needs: "session",
  session: Ember.computed.alias("controllers.session"),

  player: Ember.computed.alias("model"),

  step: function() {
    var session = this.get('session');
    return session.get('setup_assignments')[this.get('player')['id']]['Rule']['Description']
  }.property('session', 'player'),

  actions: {
    next_step: function() {
      var session_id = this.get('session').get('id');
      var player_id = this.get('player').get('id');
      return $.ajax({
        type: "PUT",
        url: App.MEEPLE_MOVER_URL+"/sessions/"+session_id+"/players/"+player_id+"/steps/"+encodeURIComponent(this.get('step')),
        data: { done: true },
      }).done(function() {
        location.reload(); // FIXME: This causes the step to update by refetching the session. FFS.
      });
    }
  }
});

App.PlayersController = Ember.ArrayController.extend();

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

App.SessionsNewController = Ember.ObjectController.extend({
  needs: ["games", "players"],
  games: Ember.computed.alias("controllers.games"),

  actions: {
    create: function() {
      var game = this.get('game');
      var session = this.store.createRecord('session', {
        game: game,
        started_date: new Date(),
      });
      var players = this.get("chosen_players");
      var i;
      for ( i = 0; i < players.length; i++ ) {
        session.get("players").pushObject(players[i]);
      }
      session.save();  // TODO: Handle errors. This is a promise.
    }
  }
});


App.Game = DS.Model.extend({
  sessions: DS.hasMany('session', {async: true}),
  // TODO: SetupRules
  name: DS.attr('string'),
});

App.GameSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    var newPayload = {};
    // Collection has root property, but comes in capitalized
    if ( typeof payload.Games != "undefined" ) {
      newPayload.games = payload.Games;
      delete payload.Games;
    }
    // Element needs root property
    else {
      newPayload.game = payload;
    }

    return this._super(newPayload);
  },
});


App.Player = DS.Model.extend({
  sessions: DS.hasMany('session', {async: true}),
  name: DS.attr('string'),
});

App.PlayerSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    var newPayload = {};
    // Add root property
    newPayload.players = payload;

    return this._super(newPayload);
  },
});


App.Session = DS.Model.extend({
  game: DS.belongsTo('game', {async: true}),
  players: DS.hasMany('player', {async: true}),
  setup_assignments: DS.attr('raw'),
  started_date: DS.attr('date'),
});

App.SessionSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(payload) {
    var newPayload = {};
    // Add root property
    newPayload.sessions = payload;

    return this._super(newPayload);
  },

  normalize: function(type, hash, prop) {
    // Turn embedded objects into lists of IDs
    hash["game"] = hash["Game"]["id"];
    hash["players"] = [];
    var i;
    for ( i = 0; i < hash["Players"].length; i++ ) {
      hash["players"].push(hash["Players"][i]["id"]);
    }

    hash["setup_assignments"] = hash["SetupAssignments"];
    delete hash["SetupSteps"];  // TODO

    return this._super(type, hash, prop);
  },
});

App.RawDataTransform = DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized;
  },
  serialize: function(deserialized) {
    return deserialized;
  },
});
App.register("transform:raw", App.RawDataTransform);
