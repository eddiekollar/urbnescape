'use strict';

/* Directives */


angular.module('urbnEscape.directives', []).
  directive('sap', ['LocationData', function(LocationData) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            var marker = L.marker();
            var map = L.map('map');
            map.doubleClickZoom.disable();

            //create a CloudMade tile layer and add it to the map
            L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);

            /*
            //add markers dynamically
            var points = [{lat: 40, lng: -86},{lat: 40.1, lng: -86.2}];
            updatePoints(points);

            function updatePoints(pts) {
                for (var p in pts) {
                    L.marker([pts[p].lat, pts[p].lng]).addTo(map);
                }
            }

            //add a watch on the scope to update your points.
            // whatever scope property that is passed into
            // the poinsource="" attribute will now update the points
            scope.$watch(attr.pointsource, function(value) {
                updatePoints(value);
            });
            */

            function GetServiceUrl(latlng) {
                var parameters = L.Util.extend({
                    format: 'json',
                    lat: latlng.lat,
                    lon: latlng.lng,
                    zoom: 18,
                    addressdetails: 1
                });

                return 'http://nominatim.openstreetmap.org/reverse'
                    + L.Util.getParamString(parameters);
            };

            function GetData(url) {
                $.getJSON(url, function (data) {
                    try {
                        //var results = provider.ParseJSON(data);
                        $('#location').val(data.address.road + " " + data.address.city + ", " + data.address.state);
                    }
                    catch (error) {
                        alert(error);
                    }
                }.bind(this));
            };

            function onLocationFound(e) {
                var radius = e.accuracy / 2;

                marker = L.marker(e.latlng).addTo(map);
            }

            function onLocationError(e) {
                alert(e.message);
            }

            map.on('dblclick', function(e) {
                marker.setLatLng(e.latlng);
                scope[attrs.ngModel].lat = parseFloat(e.latlng.lat).toFixed(5);
                scope[attrs.ngModel].lon = parseFloat(e.latlng.lng).toFixed(5);

                // e is an event object (MouseEvent in this case)
                var url = GetServiceUrl(e.latlng);
                GetData(url);
            });

            map.on('locationfound', onLocationFound);
            map.on('locationerror', onLocationError);

            map.locate({setView: true, maxZoom: 14});
        }
    };
  }])
  .directive('ngFocus', [function() {
    var FOCUS_CLASS = "ng-focused";
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$focused = false;
            element.bind('focus', function(evt) {
                element.addClass(FOCUS_CLASS);
                scope.$apply(function() {ctrl.$focused = true;});
            }).bind('blur', function(evt) {
                    element.removeClass(FOCUS_CLASS);
                    scope.$apply(function() {ctrl.$focused = false;});
                });
        }
    }
}])
    .directive('ensureUnique', ['$http', '$timeout', function($http, $timeout) {
    var checking = null;
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, c) {
            scope.$watch(attrs.ngModel, function(newVal) {
                if (!checking) {
                    console.log(ele[0].value);
                    checking = $timeout(function() {
                        $http.post('/-/api/v1/check/' + attrs.ensureUnique, {'field': ele[0].value})
                        .success(function(data, status, headers, cfg) {
                                console.log(data);
                                c.$setValidity('unique', (data == 'true'));
                                checking = null;
                            }).error(function(data, status, headers, cfg) {
                                checking = null;
                            });
                    }, 500);
                }
            });
        }
    }
}]);
