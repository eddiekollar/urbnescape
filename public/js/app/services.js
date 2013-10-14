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

                    console.log("Original location: " + position.coords.longitude + " " + position.coords.latitude);
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
                alert(status + " | bad");
            });
    }}
});
