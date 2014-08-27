var classify = Ember.String.classify;

var RouteDebug = Ember.Object.extend({

  router: Ember.computed(function() {
    return this.get('application.__container__').lookup('router:main');
  }).property('application'),

  applicationController: Ember.computed(function() {
    var container = this.get('application.__container__');
    return container.lookup('controller:application');
  }).property('application'),

  routeTree: Ember.computed(function() {
    var routeNames = this.get('router.router.recognizer.names');
    var routeTree = {};

    for(var routeName in routeNames) {
      if (!routeNames.hasOwnProperty(routeName)) {
        continue;
      }
      var route = routeNames[routeName];
      var handlers = Ember.A(route.handlers);
      buildSubTree.call(this, routeTree, route);
    }

    return arrayizeChildren({  children: routeTree }).children[0];
  }).property('router')
});


var buildSubTree = function(routeTree, route) {
  var handlers = route.handlers;
  var subTree = routeTree, item,
      routeClassName, routeHandler, controllerName,
      controllerClassName, container, templateName,
      controllerFactory;
  for (var i = 0; i < handlers.length; i++) {
    item = handlers[i];
    var handler = item.handler;
    if (subTree[handler] === undefined) {
      routeClassName = classify(handler.replace('.', '_')) + 'Route';
      container = this.get('application.__container__');
      routeHandler = container.lookup('router:main').router.getHandler(handler);
      controllerName = routeHandler.get('controllerName') || routeHandler.get('routeName');
      controllerClassName = classify(controllerName.replace('.', '_')) + 'Controller';
      controllerFactory = container.lookupFactory('controller:' + controllerName);
      templateName = handler.replace('.', '/');

      subTree[handler] = {
        value: {
          name: handler,
          routeHandler: {
            className: routeClassName,
            name: handler
          },
          controller: {
            className: controllerClassName,
            name: controllerName,
            exists: controllerFactory ? true : false
          },
          template: {
            name: templateName
          }
        }
      };

      if (i === handlers.length - 1) {
        // it is a route, get url
        subTree[handler].value.url = getURL(container, route.segments);
        subTree[handler].value.type = 'route';
      } else {
        // it is a resource, set children object
        subTree[handler].children = {};
        subTree[handler].value.type = 'resource';
      }

    }
    subTree = subTree[handler].children;
  }
};

function arrayizeChildren(routeTree) {
  var obj = { value: routeTree.value };

  if (routeTree.children) {
    var childrenArray = [];
    for(var i in routeTree.children) {
      var route = routeTree.children[i];
      childrenArray.push(arrayizeChildren(route));
    }
    obj.children = childrenArray;
  }

  return obj;
}

function getURL(container, segments) {
  var locationImplementation = container.lookup('router:main').location;
  var url = [];
  for (var i = 0; i < segments.length; i++) {
    var name = null;

    try {
      name = segments[i].generate();
    } catch (e) {
      // is dynamic
      name = ':' + segments[i].name;
    }
    if (name) {
      url.push(name);
    }
  }

  url = url.join('/');

  if (url.match(/_unused_dummy_/)) {
    url = '';
  } else {
    url = '/' + url;
    url = locationImplementation.formatURL(url);
  }

  return url;
}

export default RouteDebug;
