'use strict';

/* Directives */


angular.module('urbnEscape.directives', []).
  directive('sap', [function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            var marker = L.marker();

            var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/96818/256/{z}/{x}/{y}.png',
            cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
            map = new L.Map('map', {layers: [cloudmade], zoom: 14 }),
            editableLayers = new L.FeatureGroup();

            map.doubleClickZoom.disable();
            map.addLayer(editableLayers);
            L.drawLocal.draw.toolbar.buttons.polyline = "Draw a path";
            L.drawLocal.draw.toolbar.buttons.marker = "Add a place";

            var options = {
                draw: {
                    polyline: {
                        metric: false
                    },
                    polygon: false,
                    circle: false,
                    rectangle: false
                },
                edit: {
                    featureGroup: editableLayers
                }
            };

            var drawControl = new L.Control.Draw(options);
            map.addControl(drawControl);

            map.on('draw:drawstart', function (e) {
                var type = e.layerType;

                map.removeLayer(marker);

                if(type === 'marker'){
                }else if(type === 'polyline'){
                    editableLayers.clearLayers();
                }
            });

            var GetServiceUrl = function(latlng) {
                var parameters = L.Util.extend({
                    format: 'json',
                    lat: latlng.lat,
                    lon: latlng.lon,
                    zoom: 18,
                    addressdetails: 1
                });

                return 'http://nominatim.openstreetmap.org/reverse'
                    + L.Util.getParamString(parameters);
            };

            var GetData = function (url) {
                $.getJSON(url, function (data) {
                    try {
                        //var results = provider.ParseJSON(data);
                        $('#location').val(data.address.road + " " + data.address.city + ", " + data.address.state);
                        scope[attrs.ngModel].location = data.address.road + " " + data.address.city + ", " + data.address.state;
                    }
                    catch (error) {
                        alert(error);
                    }
                }.bind(this));
            };

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                console.log(e);
                var latLngs = [];

                function cleanObj(obj) {
                    return {lat: obj.lat, lon: obj.lng};
                }

                if (type === 'marker') {
                    editableLayers.clearLayers();
                    latLngs = [cleanObj(layer.getLatLng())];
                }else if(type==='polyline'){
                    angular.copy(layer.getLatLngs(), latLngs);
                    latLngs = latLngs.map(cleanObj);
                }
                editableLayers.addLayer(layer);
                console.log(latLngs);
                scope[attrs.ngModel].geoData.latLngs = latLngs;
                scope[attrs.ngModel].geoData.layerType = type;

                var url = GetServiceUrl(latLngs[0]);
                GetData(url);
            });

            function onLocationFound(e) {
                var radius = e.accuracy / 2;

                marker = L.marker(e.latlng).addTo(map);
            }

            function onLocationError(e) {
                alert(e.message);
            }

            map.on('locationfound', onLocationFound);
            map.on('locationerror', onLocationError);

            map.locate({setView: true});
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
            scope.$watch(attrs.ngModel, function(newVal, oldVal) {
                if(typeof newVal == 'undefined' || newVal == ''){
                    return;
                }
                if((typeof scope['originalObj'] != 'undefined')){
                    if(newVal == scope['originalObj'][attrs.ensureUnique]){
                        checking = true;
                    }else{
                        checking = false;
                    }
                }
                if (!checking) {
                    checking = $timeout(function() {
                        $http.post('/-/api/v1/check/' + attrs.ensureUnique, {'field': newVal})
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
}])
    .directive('favoriteButton', ['$rootScope', '$http', function($rootScope, $http) {
    return {
        restrict: 'A',
        scope: {
          isfavorite: '@'
        },
        link: function(scope, element, attrs, ctrl) {
            var inFavorites = scope.$parent.$parent.inFavorites;
            var placeId = scope.$parent.place._id

            if(inFavorites(placeId)){
                element.addClass('favorite');
                element.removeClass('nofavorite');
            }else{
                element.addClass('nofavorite');
                element.removeClass('favorite');
            }

            element.bind('click', function(evt) {
                if(typeof placeId !== 'undefined'){
                    if(! inFavorites(placeId)){
                        element.addClass('favorite');
                        element.removeClass('nofavorite');
                        $http.post('/-/api/v1/favorites', {'userId': $rootScope.user.id, 'placeId': placeId})
                            .success(function(data){
                                scope.$parent.$parent.myFavorites.push(placeId);
                            })
                            .error(function(error) {
                                console.log(error);
                            });
                    }else if(inFavorites(placeId)){
                        element.addClass('nofavorite');
                        element.removeClass('favorite');
                        $http.delete('/-/api/v1/favorites/' + $rootScope.user.id + '/' + placeId)
                            .success(function(data){
                                var indx = scope.$parent.$parent.myFavorites.indexOf(placeId);
                                if(indx !== -1){
                                    scope.$parent.$parent.myFavorites.splice(indx, 1);
                                }
                            })
                            .error(function(error) {
                                console.log(error);
                            });
                    }
                }
            });
        }
    }
}]);
