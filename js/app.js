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

App.NavRoute = Ember.Route.extend({
  beforeModel: function() {
    Ember.$('div.nav-spinner').addClass('spinner');
    Ember.$('#error-banner').removeClass('show');
    Ember.$('#error-banner').addClass('hidden');
  },
  afterModel: function() {
    Ember.$('div.nav-spinner').removeClass('spinner');

    Ember.$('div.session').removeClass('hidden').addClass('show').removeClass('berserker');
  },
});

App.GamesRoute = App.NavRoute.extend({
  model: function() {
    return this.store.find('game');
  }
});

App.GameRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('game', params.game_id);
  }
});

App.SessionsRoute = App.NavRoute.extend({
  model: function() {
    return this.store.find('session');
  },
  actions: {
    willTransition: function(transition) {
      if ( "sessions.index" === transition.intent.name ) {
        Ember.$('div.session').removeClass('hidden').addClass('show').removeClass('berserker');
      }
      return true;
    }
  }
});

App.SessionRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('session', params.session_id);
  },
  afterModel: function(session) {
    this._super(session);

    // FIXME: Styles not applied when URL is navigated to directly. This hook fires,
    // but the divs are not rendered yet.
    // Perhaps this helps? http://madhatted.com/2013/6/8/lifecycle-hooks-in-ember-js-views
    Ember.$('div.session').removeClass('show').addClass('hidden').removeClass('berserker');
    Ember.$('#session-' + session.id).addClass('berserker').removeClass('hidden').addClass('show');

    return null;
  }
});

App.SessionsNewRoute = Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      games: this.store.findAll('game'),
      players: this.store.findAll('player'),
    });
  },
  setupController: function(controller, model) {
    var games = model.games;
    var players = model.players;

    controller.set('games', games);
    controller.set('players', players);
  },
});

App.SessionStepRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  }
});

App.PlayersRoute = App.NavRoute.extend({
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

App.GamesController.numPlayersFunc = function(game) {
  var min = game.get('min_players');
  var max = game.get('max_players');
  if ( min == max ) {
    return "" + min + " players";
  }
  return "" + min + "-" + max + " players";
};
Ember.Handlebars.helper('numPlayers', App.GamesController.numPlayersFunc, 'min_players', 'max_players');

App.SessionController = Ember.ObjectController.extend();

App.SessionController.sessionDivIdFunc = function(session) {
  var id = Handlebars.Utils.escapeExpression(session.id);
  return new Ember.Handlebars.SafeString('<div class="session" id="session-' + id + '">');
};
Ember.Handlebars.helper('sessionDivId', App.SessionController.sessionDivIdFunc, 'id');

App.SessionStepController = Ember.ObjectController.extend({
  needs: "session",
  session: Ember.computed.alias("controllers.session"),

  player: Ember.computed.alias("model"),

  step: function() {
    var session = this.get('session');
    return session.get('setup_assignments')[this.get('player')['id']]['Rule']['Description']
  }.property('session', 'player'),

  stepDetails: function() {
    var session = this.get('session');
    return session.get('setup_assignments')[this.get('player')['id']]['Rule']['Details']
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
        // self.get('session').reload() doesn't work (when self is assigned this before the return)
      });
    }
  }
});

App.PlayersController = Ember.ArrayController.extend({
  actions: {
    create: function() {
      Ember.$('#error-banner').removeClass('show');
      Ember.$('#error-banner').addClass('hidden');

      var player = this.store.createRecord('player', {
        name: this.get('name')
      });
      var self = this;
      player.save().then(function() {
        self.set('name', '');
      }, function() {
        Ember.$('#error-banner > p').text("Could not create player named "+player.get('name'));
        Ember.$('#error-banner').addClass("show");
        Ember.$('#error-banner').removeClass("hidden");
        self.store.deleteRecord(player);
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

App.SessionsNewController = Ember.ArrayController.extend({
  actions: {
    create: function() {
      Ember.$('#error-banner').removeClass('show');
      Ember.$('#error-banner').addClass('hidden');

      var game = this.get('game');
      var players = this.get('chosen_players');

      if ( game.get('min_players') > players.length || players.length > game.get('max_players') ) {
        Ember.$('#error-banner > p').text(""+game.get("name")+" supports "+App.GamesController.numPlayersFunc(game));
        Ember.$('#error-banner').addClass("show");
        Ember.$('#error-banner').removeClass("hidden");
        return;
      }

      var session = this.store.createRecord('session', {
        game: game,
        started_date: new Date(),
      });
      session.get('players').set('content', players);
      session.save();  // TODO: Handle errors. This is a promise.
    }
  }
});


App.Game = DS.Model.extend({
  sessions: DS.hasMany('session', {async: true}),
  // TODO: SetupRules
  name: DS.attr('string'),
  min_players: DS.attr('number'),
  max_players: DS.attr('number'),
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
