'use strict';


// Declare app level module which depends on filters, and services
angular.module('urbnEscape', ['urbnEscape.filters', 'urbnEscape.services', 'urbnEscape.directives', 'urbnEscape.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/addPlaceView', {templateUrl: '/public/partials/addPlaceView.html', controller: 'AddPlaceCtrl'});
    $routeProvider.when('/placesView', {templateUrl: '/public/partials/placesView.html', controller: 'PlacesCtrl'});
    $routeProvider.otherwise({redirectTo: '/addPlaceView'});
  }]);
