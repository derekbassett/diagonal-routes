import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'diagonal', // TODO: loaded via config
  Resolver: Resolver,
  rootElement: '#main-app'
});

loadInitializers(App, 'diagonal');

export default App;
