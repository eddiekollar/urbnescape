'use strict';

/* Controllers */

angular.module('urbnEscape.controllers', []).
  controller('AddPlaceCtrl', ['$scope', '$http', 'LocationData', function($scope, $http, LocationData) {

    //Initialize form data
    $scope.place = LocationData;

    $scope.displayData = function(place){
        alert(place.location);
    };

    $scope.saveData = function(place){
        $http.post('/places', place).
            success(function(data) {
            // this callback will be called asynchronously
            // when the response is available
                alert('Successfully saved!');
        });
    };
  }])
  .controller('PlacesCtrl', [function() {

  }]);