// Declare app level module which depends on filters, and services
angular.module('urbnEscape', ['urbnEscape.filters', 'urbnEscape.services', 'urbnEscape.directives', 'urbnEscape.controllers', 'cloudinary', 'urbnEscape.cloudinary']).
  config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
    //$locationProvider.html5Mode(true);

    $routeProvider.when('/logIn',               {templateUrl: '/public/partials/logIn.html', controller: 'LogInCtrl'});
    $routeProvider.when('/signUp',               {templateUrl: '/public/partials/signUp.html', controller: 'SignUpCtrl'});
    $routeProvider.when('/addPlaceView',        {templateUrl: '/public/partials/addPlaceView.html', controller: 'AddPlaceCtrl'});
    $routeProvider.when('/placesView',          {templateUrl: '/public/partials/placesView.html', controller: 'PlacesCtrl'});
    $routeProvider.when('/placeDetailsView',    {templateUrl: '/public/partials/placeDetailsView.html', controller: 'PlaceDetailsCtrl'});
    $routeProvider.when('/profile',             {templateUrl: '/public/partials/profile.html', controller: 'ProfileCtrl'});
    $routeProvider.when('/favorites',           {templateUrl: '/public/partials/placesView.html', controller: 'FavoritesCtrl'});
    $routeProvider.when('/placeDirections',     {templateUrl: '/public/partials/placeDirections.html', controller: 'DirectionsCtrl', 
        resolve: {
          directions: function($q, Session, Directions){
            var deferred = $q.defer();

            var successCb = function (err, result) {
                if (angular.equals(result, null)) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            };

            Directions.getDirections(Session.getLocation(), Session.place.geoData.latLngs[0], successCb);
            return deferred.promise;
          }
    }});
    $routeProvider.otherwise({redirectTo: '/placesView'});

  }]);