'use strict';

/* Controllers */

angular.module('urbnEscape.controllers', []).
  controller('MainCtrl', ['$rootScope', '$scope', '$http', '$location', 'CurrentCategory', function($rootScope, $scope, $http, $location, CurrentCategory){
    $scope.category = CurrentCategory.name;

    $scope.setCategory = function(newCategory) {
        CurrentCategory.name = newCategory;
        $location.path('/placesView');
    };

    $scope.logInPage = function(){
        $location.path('/logIn');
    };

    $scope.signUpPage = function(){
        $location.path('/signUp');
    };

    $scope.logOut = function(){
        $http.get('/-/auth/logout')
            .success(function(user){
                $rootScope.user = null;
                $rootScope.authenticated = false;
                $location.path('/placesView');
            }).error(function(error) {
                $scope.errorMessage = error.message;
            });
    };
  }])
  .controller('LogInCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    $scope.errorMessage = '';

    $scope.logIn = function(){
        $http.post('/-/auth/login', $scope.user)
            .success(function(user){
                $rootScope.user = user;
                $rootScope.authenticated = true;
                $location.path('/placesView');
            }).error(function(error) {
                $scope.errorMessage = error.message;
            });
    };

    $scope.facebookLogIn = function() {

    };

    }])
  .controller('SignUpCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    $scope.signUp = function(){
        $http.post('/-/api/v1/user', $scope.user)
            .success(function(user){
                $rootScope.user = user;
                $rootScope.authenticated = true;
                $location.path('/placesView');
            }).error(function(error) {
                $scope.errorMessage = error.message;
            });
    };
    }])
  .controller('AddPlaceCtrl', ['$rootScope', '$scope', '$http', '$location', 'CurrentCategory', function($rootScope, $scope, $http, $location, CurrentCategory) {
    //Initialize form data
    if(!$rootScope.authenticated){
        $location.path('/placesView');
    }

    $scope.place = {};
    $scope.place.category = CurrentCategory.name;
    $scope.review = {quietlevel:1, crowd: 1};

    $scope.categories = ['VIEW', 'PARK', 'TRAIL', 'SOLITUDE'];

    $scope.activate = function(category){
        $scope.place.category = category;
    };

    $scope.addPlace = function(){
        $scope.place.userId = $rootScope.user.id;
        $scope.review.userId = $rootScope.user.id;

        $http.post('/-/api/v1/places', {place: $scope.place, review: $scope.review}).
            success(function(data) {

        }).error(function(error) {
                $scope.errorMessage = error.message;
            });

        $location.path('/placesView');
    };
  }])
  .controller('PlacesCtrl', ['$rootScope', '$scope', '$http', '$location' ,'CurrentCategory', 'CurrentPlaceService' , function($rootScope, $scope, $http, $location, CurrentCategory, CurrentPlaceService) {
    //Get data from server to list out places
    $scope.category = CurrentCategory.name;

    $http.get('/-/api/v1/places/category/'+$scope.category.toLowerCase())
        .success(function(data){
            $scope.places = data;
    });

    $scope.getDetails = function(place) {
        CurrentPlaceService.set(place);
        $location.path('/placeDetailsView');
    };

    $scope.addPlacePage = function(){
        $location.path('/addPlaceView');
    };
    /*
    $http.get('/placeslist', {category : $scope.category}).
        success(function(data){
            $scope.places = data;
            console.log("Data received");
    }); */
  }])
  .controller('PlaceDetailsCtrl', ['$scope', '$http', '$location', 'CurrentPlaceService', function($scope, $http, $location, CurrentPlaceService) {
    $scope.place = CurrentPlaceService.get();

    console.log($scope.place.id);

    $http.get('/-/api/v1/reviews/'+$scope.place._id)
        .success(function(data){
            $scope.reviews = data;
        });
  }])
  .controller('MapCtrl', ['$scope', '$http', 'CurrentPlaceService', function($scope, $http, CurrentPlaceService) {
    $scope.place = CurrentPlaceService.get();

    var latLng = new L.LatLng(parseFloat($scope.place.lat), parseFloat($scope.place.lon));

    var map = L.map('map').setView(latLng, 14);
    L.marker(latLng).addTo(map);
    map.doubleClickZoom.disable();

    //create a CloudMade tile layer and add it to the map
    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        setView: true
    }).addTo(map);

}]);