'use strict';

/* Controllers */

angular.module('urbnEscape.controllers', ['ngCookies'])
.controller('MainCtrl', ['$rootScope', '$scope', '$http', '$location', '$cookieStore', 'Session', function($rootScope, $scope, $http, $location, $cookieStore, Session){
    Session.setLocation();
    $scope.category = Session.currentCategory;
    $cookieStore.put('CurrentCategory', $scope.category);
    
    $scope.setCategory = function(newCategory) {
        Session.currentCategory = newCategory;
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

    $scope.back = function() {
        console.log($location);
    }
}]).controller('LogInCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
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
        $http.get('/-/auth/facebook/login')
            .success(function(url){
                console.log(url);
                //$window.location.href = url;
            });
    };
}]).controller('SignUpCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
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
}]).controller('AddPlaceCtrl', ['$rootScope', '$scope', '$http', '$location', 'Session', 'cloudinary', function($rootScope, $scope, $http, $location, Session, cloudinary) {
    //Initialize form data
    if(!$rootScope.authenticated){
        $location.path('/placesView');
    }

    $scope.place = {};
    $scope.place.category = Session.currentCategory;
    $scope.place.geoData = {};
    $scope.place.image = {};
    $scope.review = {quietlevel:1, crowd: 1};

    $scope.categories = ['VIEW', 'PARK', 'PATH', 'SOLITUDE'];

    $scope.activate = function(category){
        $scope.place.category = category;
        Session.currentCategory = category;
    };

    $scope.addPlace = function(){
        if($scope.place.geoData.latLngs.length > 0){
            $scope.place.createdBy = $rootScope.user.id;
            $scope.review.createdBy = $rootScope.user.id;

            $http.post('/-/api/v1/places', {place: $scope.place, review: $scope.review}).
                success(function(data) {
                    $scope.place = data;
                    Session.place = data;
            }).error(function(error) {
                    console.log(error);
                    $scope.errorMessage = error.message;
                });

            $location.path('/placeDetailsView');
        }else
            window.alert("Add something on the map");
    };
}]).controller('PlacesCtrl', ['$rootScope', '$scope', '$http', '$location' ,'Session', function($rootScope, $scope, $http, $location, Session) {
    //Get data from server to list out places
    $scope.category = Session.currentCategory;
    $scope.hasCategory = true;

    $http.get('/-/api/v1/places/category/'+$scope.category.toLowerCase())
        .success(function(data){
            $scope.places = data;
    });

    $scope.getDetails = function(place) {
        Session.place = place;
        $location.path('/placeDetailsView');
    };

    $scope.addPlacePage = function(){
        $location.path('/addPlaceView');
    };

    if($rootScope.authenticated){
        $http.get('/-/api/v1/favorites/ids/')
            .success(function(data){
                if(typeof data !== 'undefined'){
                    Session.user.favorites = data;
                }
            }).error(function(error) {
                console.log(error);
            });
    }
}]).controller('PlaceDetailsCtrl', ['$rootScope', '$scope', '$http', '$location', 'Session', function($rootScope, $scope, $http, $location, Session) {
    $scope.originalObj = {};
    $scope.place = Session.place;
    $scope.needsReview = false;
    $scope.hasReview = false;
    $scope.editMode = false;
    $scope.isAdmin = ($rootScope.authenticated && $rootScope.user.isAdmin) || false;

    if(typeof $scope.place._id === 'undefined'){
        $location.path('/placesView');
    }

    if($rootScope.authenticated){
        $http.get('/-/api/v1/reviews/me/' + $scope.place._id)
            .success(function(data){
                $scope.myReview = data;
                if(typeof data._id !== 'undefined'){
                    $scope.originalObj = angular.copy(data);
                    $scope.hasReview = true;
                }
            }).error(function(error) {
                console.log(error);
        });

        $scope.updatePlace = function(){
            $http.get('/-/api/v1/places/' + $scope.place._id).
            success(function(data) {
                $scope.place = angular.copy(data);
            }).error(function(error) {
                $scope.errorMessage = error.message;
            });
        };

        $scope.setEditMode = function(){
            $scope.editMode = !$scope.editMode;
        };

        $scope.createReview = function(){
            $scope.myReview = {quietlevel:1, crowd: 1};
            $scope.setEditMode();
        };

        $scope.cancel = function(){
            console.log($scope.originalObj);
            $scope.myReview = angular.copy($scope.originalObj);
            $scope.setEditMode();
        };

        $scope.deleteMyReview = function(){
            $http.delete('/-/api/v1/reviews/'+$scope.myReview._id)
                .success(function(data){

                }).error(function(error) {
                    console.log(error);
                });
            for(var i = 0; i < $scope.reviews.length; i++){
                if ($scope.reviews[i]._id === $scope.myReview._id) {
                    console.log("Found it. Reviews: " + $scope.reviews.length);
                    $scope.reviews.splice(i, 1);
                    console.log("Removed it. Reviews: " + $scope.reviews.length);
                    break;
                }
            }

            $scope.myReview = {};
            $scope.needsReview = false;
            $scope.hasReview = false;
        };

        $scope.saveMyReview = function(){
            $scope.myReview.createdBy = $rootScope.user.id;
            if(!$scope.hasReview){
                $scope.myReview.placeId= $scope.place._id;
                $http.post('/-/api/v1/reviews', {review: $scope.myReview}).
                    success(function(data) {
                        $scope.hasReview = true;
                        $scope.myReview = data;
                        $scope.needsReview = false;
                    }).error(function(error) {
                        $scope.errorMessage = error.message;
                    });
            }else if(!angular.equals($scope.originalObj, $scope.myReview)){
                $http.put('/-/api/v1/reviews/' + $scope.myReview._id, {review: $scope.myReview}).
                    success(function(data) {
                        $scope.myReview = data;
                    }).error(function(error) {
                        $scope.errorMessage = error.message;
                        console.log(error);
                    }).then(function(){
                        $scope.updatePlace();
                    });
            }

            $scope.setEditMode();
        };
    }

    $http.get('/-/api/v1/reviews/'+$scope.place._id)
        .success(function(data){
            $scope.reviews = data;
        }).error(function(error) {
            console.log(error);
        });

    $scope.getDirections = function(){
        $location.path('/placeDirections');
    }
}]).controller('ProfileCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    if(!$rootScope.authenticated){
        $location.path('/placesView');
    }

    $scope.originalObj = {};
    $scope.editMode = false;
    $scope.profile = {};

    $http({method: 'GET', url: '/-/api/v1/user/me/'})
        .success(function(data){
            $scope.originalObj = angular.copy(data.profile);
            $scope.profile = data.profile;
        }).error(function(error) {
            console.log(error);
        });

    $scope.setEditMode = function(){
        $scope.editMode = !$scope.editMode;
    };

    $scope.cancel = function(){
        console.log($scope.originalObj);
        $scope.profile = angular.copy($scope.originalObj);
        $scope.setEditMode();
    };

    $scope.saveProfile = function(){
        if(!angular.equals($scope.profile, $scope.originalObj)){
            $http.put('/-/api/v1/user/', {userId: $scope.user.id, user: $scope.profile}).
            success(function(data) {
                $rootScope.user = data.username;
                console.log(data);
            }).error(function(error) {
                $scope.errorMessage = error.message;
                console.log(error);
            });
        }

        $scope.setEditMode();
    };
}]).controller('FavoritesCtrl', ['$rootScope', '$scope', '$http', '$location' ,'Session', function($rootScope, $scope, $http, $location, Session) {
    $scope.hasCategory = false;

    $http.get('/-/api/v1/places/favorites/me/')
        .success(function(data){
            $scope.places = data;
        }).error(function(error){
            console.log(error);
        });

    $http.get('/-/api/v1/favorites/ids/')
        .success(function(data){
            Session.user.favorites = data;
        }).error(function(error) {
            console.log(error);
        });
}]).controller('PlaceCtrl', ['$rootScope', '$scope', '$http', '$location' ,'Session', function($rootScope, $scope, $http, $location, Session) {
    $scope.getDetails = function(place) {
        Session.place = place;
        $location.path('/placeDetailsView');
    };

    $scope.removePlace = function(id) {
        for(var p in $scope.places){
            if($scope.places[p]._id === id){
                delete $scope.places[p];
            }
        }
    };
}]).controller('DirectionsCtrl', ['$rootScope', '$scope', '$http', '$location' ,'directions', function($rootScope, $scope, $http, $location, directions) {
    $scope.distance = directions.routes[0].legs[0].distance.text;
    $scope.duration = directions.routes[0].legs[0].duration.text;
    $scope.bounds = directions.routes[0].bounds; 
    $scope.steps = directions.routes[0].legs[0].steps;

}]);