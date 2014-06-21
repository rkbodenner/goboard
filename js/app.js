App = Ember.Application.create();

App.ApplicationAdapter = DS.RESTAdapter.extend({
  host: 'http://localhost:8080',
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
        url: "http://localhost:8080/sessions/"+session_id+"/players/"+player_id+"/steps/"+encodeURIComponent(this.get('step')),
        data: { done: true },
      });
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


App.Game = DS.Model.extend({
  sessions: DS.hasMany('session'),
  name: DS.attr('string'),
});

App.GameSerializer = DS.JSONSerializer.extend({
  normalize: function(type, hash) {
    return this._super.apply(this, arguments);
  },
});


App.Player = DS.Model.extend({
  name: DS.attr('string'),
});

// Why this is necessary is now a mystery... Same goes for Game.
App.PlayerSerializer = DS.JSONSerializer.extend({
  normalize: function(type, hash) {
    return this._super.apply(this, arguments);
  },
});


App.Session = DS.Model.extend({
  game: DS.belongsTo('game'),
  players: DS.hasMany('player', { async: true }),
  setup_assignments: DS.attr('raw'),
  started_date: DS.attr('date'),
});

App.SessionSerializer = DS.JSONSerializer.extend({
  normalize: function(type, hash) {
    hash["game"] = hash["Game"]["id"];
    hash["players"] = [1, 2];  // FIXME
    hash["setup_assignments"] = hash["SetupAssignments"];

    return this._super.apply(this, arguments);
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
