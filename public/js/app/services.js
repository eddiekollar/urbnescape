'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('urbnEscape.services', []).
  factory('LocationData', function(){
        return {
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
  })
  .factory('CurrentCategory', function() {
        return {
            name : "VIEW"
        };
    });