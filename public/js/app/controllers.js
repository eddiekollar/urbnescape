'use strict';

/* Controllers */

angular.module('urbnEscape.controllers', []).
  controller('MainCtrl', ['$scope', '$location', 'CurrentCategory', function($scope, $location, CurrentCategory){
    $scope.category = CurrentCategory.name;

    $scope.setCategory = function(newCategory) {
        CurrentCategory.name = newCategory;
        $location.path('/placesView');
    };
  }])
  .controller('AddPlaceCtrl', ['$scope', '$http', '$location', 'LocationData', 'CurrentCategory', function($scope, $http, $location, LocationData, CurrentCategory) {
    //Initialize form data
    $scope.place = LocationData;

    $scope.place.category = CurrentCategory.name;

    $scope.categories = ['VIEW', 'PARK', 'TRAIL', 'LOUNGE'];

    $scope.activate = function(category){
        $scope.place.category = category;
        console.log($scope.place.category);
    };

    $scope.saveData = function(place){

        $http.post('/places', place).
            success(function(data) {
                console.log('Successfully saved!');
        });

        $location.path('/placesView');
    };
  }])
  .controller('PlacesCtrl', ['$scope', '$http', 'CurrentCategory', function($scope, $http, CurrentCategory) {
    //Get data from server to list out places
    $scope.category = CurrentCategory.name;

    $http({url: '/placeslist',
        method: "GET",
        params: {category : $scope.category}
    }).success(function(data){
            $scope.places = data;
            console.log("Data received");
        });
    /*
    $http.get('/placeslist', {category : $scope.category}).
        success(function(data){
            $scope.places = data;
            console.log("Data received");
    }); */
  }])
  .controller('PlaceDetailCtrl', ['$scope', '$http', function($scope, $http) {

  }]);