'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('urbnEscape.services', []).
  factory('Session', function($http, $cookieStore) {
    var Session = {
        currentCategory: ($cookieStore.get("currentCategory") || "VIEW"),
        place: {},
        data: {

            authenticated: false
        },
        user: {
            id: 0,
            username:''
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
    return $resource('http://localhost\\:3000/user/:userId', {}, {
        get: {method:'GET', params:{userId:'@userId'}},
        post: {method:'POST', data: {}},
        update: {method:'PUT', data: {}},
        remove: {method:'DELETE'}
    });
});
