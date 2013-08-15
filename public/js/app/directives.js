'use strict';

/* Directives */


angular.module('urbnEscape.directives', []).
  directive('sap', ['LocationData', function(LocationData) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
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

             map.on('dblclick', function(e) {
                 LocationData.lat = e.latlng.lat;
                 LocationData.lon = e.latlng.lng;
                     // e is an event object (MouseEvent in this case)
                 var url = GetServiceUrl(e.latlng);
                 GetData(url);
             });

            function onLocationFound(e) {
                var radius = e.accuracy / 2;

                L.marker(e.latlng).addTo(map);
            }

            function onLocationError(e) {
                alert(e.message);
            }

            map.on('locationfound', onLocationFound);
            map.on('locationerror', onLocationError);

            map.locate({setView: true, maxZoom: 14});
        }
    };
  }]);
