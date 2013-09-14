'use strict';


// Declare app level module which depends on filters, and services
angular.module('urbnEscape', ['urbnEscape.filters', 'urbnEscape.services', 'urbnEscape.directives', 'urbnEscape.controllers']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);

    $routeProvider.when('/logIn',               {templateUrl: '/public/partials/logIn.html', controller: 'LogInCtrl'});
    $routeProvider.when('/signUp',               {templateUrl: '/public/partials/signUp.html', controller: 'SignUpCtrl'});
    $routeProvider.when('/addPlaceView',        {templateUrl: '/public/partials/addPlaceView.html', controller: 'AddPlaceCtrl'});
    $routeProvider.when('/placesView',          {templateUrl: '/public/partials/placesView.html', controller: 'PlacesCtrl'});
    $routeProvider.when('/placeDetailsView',    {templateUrl: '/public/partials/placeDetailsView.html', controller: 'PlaceDetailsCtrl'});
    $routeProvider.otherwise({redirectTo: '/placesView'});
  }]);
