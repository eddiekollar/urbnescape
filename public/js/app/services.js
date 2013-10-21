'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('urbnEscape.services', []).
  factory('Session', function($http, $cookieStore) {
    var Session = {
        currentCategory: ($cookieStore.get("currentCategory") || "VIEW"),
        place: {},
        geo: {
            lat: $cookieStore.get('geo.lat'),
            lon: $cookieStore.get('geo.lon'),
        },
        data: {

            authenticated: false
        },
        user: {
            id: 0,
            username:'', 
            favorites: []
        },
        setLocation: function() {
            if ("geolocation" in navigator) {
              /* geolocation is available */
                navigator.geolocation.getCurrentPosition(function(position) {
                    $cookieStore.put('geo.lat', position.coords.latitude);
                    $cookieStore.put('geo.lon', position.coords.longitude);

                    Session.geo.lat = position.coords.latitude;
                    Session.geo.lon = position.coords.longitude;
                });
                /*
                watchID = navigator.geolocation.watchPosition(function(position) {
                    $cookieStore.put('geo.lat', position.coords.latitude);
                    $cookieStore.put('geo.lon', position.coords.longitude);
                    console.log("Location changed: " + position.coords.longitude + " " + position.coords.latitude);
                });*/
            } else {
              /* geolocation IS NOT available */
              console.log("geolocation not available");
            }
        },
        getLocation: function() {
            return Session.geo;
        },
        isAuthenticated: function() {
            return Session.data.authenticated;
        },
        saveSession: function() { /* save session data to db */ },
        updateSession: function() {
            /* load data from db */
            //Session.data = $http.get('session.json').then(function(r) { return r.data;});
            $cookieStore.get("currentCategory") = Session.currentCategory;
        }
    };
    //Session.updateSession();
    return Session;
}).factory('User', function($resource) {
    return $resource('/-/api/v1/user/:userId', {}, {
        get: {method:'GET', params:{userId:'@userId'}},
        post: {method:'POST', data: {}},
        update: {method:'PUT', data: {}},
        remove: {method:'DELETE'}
    });
}).factory('Directions', function($http){
    var Directions = {
        getDirections: function(origin, destination, fn){
            $http.get('http://maps.googleapis.com/maps/api/directions/json?origin=' + origin.lat + ',' + origin.lon 
                + '&destination=' + destination.lat + ',' + destination.lon + '&sensor=false')
                .success(function(data){
                    fn(null, data);
                }).error(function(error) {
                    fn(error, null);
                });
        }
    };

    return Directions;
});

angular.module('urbnEscape.cloudinary',[])
.factory('cloudinary', function($http) {
    return {
        'getUploadAttrs' : function(tags, cb) {
        $http.get('/-/api/v1/cloudinary/params/get', {
            params : {
                'tstamp' : new Date().getTime(),
                'tags' : tags
            }})
            .success(function(data) {
                cb(data);
            }).
            error(function(data, status, headers, config) {
                console.log(status + " | bad");
            });
    }}
});
