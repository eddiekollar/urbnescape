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
    LocationData = {
        name: '',
        location: '',
        lat: 0,
        lon: 0,
        category: '',
        description: '',
        quietlevel: 1,
        crowd: 1,
        tips: ''
    };
    $scope.place = LocationData;

    $scope.place.category = CurrentCategory.name;

    $scope.categories = ['VIEW', 'PARK', 'TRAIL', 'LOUNGE'];

    $scope.activate = function(category){
        $scope.place.category = category;
        console.log($scope.place.category);
    };

    $scope.saveData = function(place){
        console.log('Saving data!');

        $http.post('/places', place).
            success(function(data) {
                console.log('Successfully saved!');
        });

        $location.path('/placesView');
    };
  }])
  .controller('PlacesCtrl', ['$scope', '$http', '$location' ,'CurrentCategory', 'CurrentPlaceService' , function($scope, $http, $location, CurrentCategory, CurrentPlaceService) {
    //Get data from server to list out places
    $scope.category = CurrentCategory.name;

    $http({url: '/placeslist',
        method: "GET",
        params: {category : $scope.category}
    }).success(function(data){
            $scope.places = data;
    });

    $scope.getDetails = function(place) {
        console.log(JSON.stringify(place));
        CurrentPlaceService.set(place);
        $location.path('/placeDetailsView');
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