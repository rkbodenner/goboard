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
  this.resource('sessions');
  this.route('sessions.new', { path: '/sessions/new' });
  this.resource('session', { path: '/sessions/:session_id' }, function() {
    this.route('step', { path: '/players/:player_id/step'});
  });
  this.resource('players', function() {
    this.resource('player', { path: ':player_id' });
  });
});

App.NavRoute = Ember.Route.extend({
  beforeModel: function() {
    Ember.$('div.nav-spinner').addClass('spinner');
    Ember.$('#goboard-navbar-collapse').collapse('hide');
    App.helpers.hideErrorBanner();
  },
  afterModel: function() {
    Ember.$('div.nav-spinner').removeClass('spinner');
  },
});

App.IndexRoute = App.NavRoute.extend();

App.GamesRoute = App.NavRoute.extend({
  model: function() {
    return this.store.find('game');
  }
});

App.GameRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('game', params.game_id);
  }
});

App.SessionsRoute = App.NavRoute.extend({
  model: function() {
    return this.store.find('session');
  },
});

App.SessionRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('session', params.session_id);
  },
});

App.SessionsNewRoute = App.NavRoute.extend({
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

App.SessionStepRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  },
});

App.PlayersRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('player');
  }
});

App.PlayerRoute = App.NavRoute.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  }
});


App.helpers = {
  hideErrorBanner: function() {
    Ember.$('#error-banner').removeClass('show').addClass('hidden');
  },
  showErrorBanner: function(msg) {
    Ember.$('#error-banner > p').text(msg);
    Ember.$('#error-banner').addClass('show').removeClass('hidden');
  },
};


App.SessionDetailView = Ember.View.extend({
  templateName: 'session-detail',

  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  },
  // FIXME
  // This works great for the session detail view, but for the index view,
  // the SessionsController is used. With that controller, we don't get the right completion
  // percentage (no such property) and we also don't select the right progress-bar divs.
  afterRenderEvent: function() {
    var progressWrapWidth = $('.progress-wrap-goboard').width();
    var progressTotal = this.get('controller.completionPercentage')/100 * progressWrapWidth;
    var animationLength = 2500;

    if ( this.get('controller.completionPercentage') === 100 ) {
      animationLength = 100;
      $('.progress-wrap-goboard').css('background', 'green');
    }

    // Animate bar to percentage length
    // .stop() used to prevent animation queueing
    $('.progress-bar-goboard').stop().animate({
        left: progressTotal
    }, animationLength);
  },
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


App.SessionsController = Ember.ArrayController.extend();


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

  isSessionDone: function() {
    return this.get('session').get('done');
  }.property('session'),

  isPlayerDone: function() {
    var session = this.get('session');
    return session.get('setup_assignments')[this.get('player')['id']]['Done'] === true;
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
      App.helpers.hideErrorBanner();

      var player = this.store.createRecord('player', {
        name: this.get('name')
      });
      var self = this;
      player.save().then(function() {
        self.set('name', '');
      }, function() {
        App.helpers.showErrorBanner("Could not create player named "+player.get('name'));

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
      App.helpers.hideErrorBanner();

      var game = this.get('game');
      var players = this.get('chosen_players');

      if ( game.get('min_players') > players.length || players.length > game.get('max_players') ) {
        App.helpers.showErrorBanner("Please select "+App.GamesController.numPlayersFunc(game)+" for "+game.get('name'));
        return;
      }

      var session = this.store.createRecord('session', {
        game: game,
        started_date: new Date(),
      });
      // Without both setting the game attribute and this, the game ID isn't serialized in the request.
      // But the integration test passes without setting the attribute above. Huh.
      session.get('game').set('content', game);
      // Welp. If I set the attribute (like I do with 'game'), I get:
      // "Uncaught Error: Cannot set read-only property "players" on object: <App.Session:ember629:null>"
      session.get('players').set('content', players);

      var self = this;
      session.save().then(function() {
        // TODO: Show a banner when we land announcing the new session
        self.transitionToRoute('session', session);
      });  // TODO: Handle errors. This is a promise.
    }
  }
});


App.Game = DS.Model.extend({
  sessions: DS.hasMany('session', {async: true}),
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
  setup_assignments: DS.attr('rawData'),
  setup_steps: DS.attr('rawData'),
  started_date: DS.attr('date'),

  undoneStepCount: function() {
    return this.get('setup_steps').reduce(function(prev, curr) {
      return prev + (curr.Done === true ? 0 : 1);
    }, 0);
  }.property('setup_steps'),

  done: function() {
    return this.get('undoneStepCount') === 0;
  }.property('undoneStepCount'),
  
  totalStepCount: function() {
    return this.get('setup_steps').length;
  }.property('setup_steps'),

  completionPercentage: function() {
    var undoneSteps = this.get('undoneStepCount');
    var totalSteps = this.get('totalStepCount');
    var doneSteps = totalSteps - undoneSteps;
    return Math.round(doneSteps / totalSteps * 100);
  }.property('totalStepCount', 'undoneStepCount'),
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
    hash["setup_steps"] = hash["SetupSteps"];

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
App.register("transform:rawData", App.RawDataTransform);
