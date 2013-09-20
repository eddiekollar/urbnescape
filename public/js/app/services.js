'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('urbnEscape.services', []).
  factory('CurrentCategory', function() {
        return {
            name : "VIEW"
        };
  })
  .factory('CurrentPlaceService', function(){
        var CurrentPlaceService = {};
        var currentPlace = {
            name: '',
            location: '',
            lat: 0,
            lon: 0,
            category: '',
            description: ''
        };

        CurrentPlaceService.set = function(newPlace) {
            currentPlace = newPlace;
        };

        CurrentPlaceService.get = function () {
            return currentPlace;
        };

        return CurrentPlaceService;
}).factory('Session', function($http) {
    var Session = {
        data: {
            authenticated: false
        },
        user: {
            id: 0,
            profile: {
                name  : {
                    last   : '',
                    first  : ''
                },
                username: '',
                email : ''
            }
        },
        isAuthenticated: function() {
            return this.data.authenticated;
        },
        saveSession: function() { /* save session data to db */ },
        updateSession: function() {
            /* load data from db */
            //Session.data = $http.get('session.json').then(function(r) { return r.data;});
        }
    };
    Session.updateSession();
    return Session;
}).factory('User', function($resource) {
    return $resource('http://localhost\\:3000/user/:userId', {}, {
        get: {method:'GET', params:{userId:'@userId'}},
        post: {method:'POST', data: {}},
        update: {method:'PUT', data: {}},
        remove: {method:'DELETE'}
    });
});
