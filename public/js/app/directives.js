'use strict';

/* Directives */


angular.module('urbnEscape.directives', [])
.directive('sap', [function() {
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
}]).directive('ensureUnique', ['$http', '$timeout', function($http, $timeout) {
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
}]).directive('favoriteButton', ['$rootScope', '$http', 'Session', function($rootScope, $http, Session) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
          placeId: '='
        },
        controller: function($scope, $element, Session){
            $scope.changed = false;
            $scope.isFavorite = function(){
                return (Session.user.favorites.indexOf($scope.placeId) !== -1);
            };

            $scope.changeStatus = function(){
                if(!$scope.isFavorite()){
                    $http.post('/-/api/v1/favorites', {'placeId': $scope.placeId})
                        .success(function(data){
                            Session.user.favorites.push($scope.placeId);
                            $scope.changed = true;
                        })
                        .error(function(error) {
                            console.log(error);
                        });
                }else {
                    $http.delete('/-/api/v1/favorites/me/' + $scope.placeId)
                        .success(function(data){
                            var indx = Session.user.favorites.indexOf($scope.placeId);
                            if(indx !== -1){
                                Session.user.favorites.splice(indx, 1);
                            }
                            if(!$scope.$parent.hasCategory){
                                $scope.$parent.removePlace($scope.placeId);
                            }
                            $scope.changed = false;
                        })
                        .error(function(error) {
                            console.log(error);
                        });

                }
            };
        },
        link: function(scope, element){
            if(scope.isFavorite()){
                element.children().addClass('favorite');
            }else{
                element.children().addClass('nofavorite');
            }
            element.bind('click', function(evt){
                scope.changeStatus();
                console.log(scope);
            });
            scope.$watch('changed', function(newVal, oldVal) {
                if(scope.isFavorite()){
                    element.children().addClass('favorite');
                    element.children().removeClass('nofavorite');
                }else{
                    element.children().addClass('nofavorite');
                    element.children().removeClass('favorite');
                }
            }, true);
        }
    };
}]).directive('placeDiv', ['$rootScope', '$http', 'Session', function($rootScope, $http, Session) {
    var placeTemplate = '<div class="well col-12" ng-controller="PlaceCtrl" ng-transclude> \
            <div class="row"> \
                <div class="col-xs-3 col-sm-3 col-md-3"> \
                    <img src="http://placehold.it/100x100" alt="..." class="img-circle img-responsive"> \
                </div> \
                <div class="col-xs-9" ng-click="getDetails(place)"> \
                    <p>{{ place.name }}</p> \
                    <p>{{ place.description }}</p> \
                    <p>{{ place.location }}</p> \
                </div> \
            </div> \
            <div class="row"> \
                <p> \
                <div class="col-xs-3" ng-show="authenticated"> \
                    <button favorite-button place-id="place._id" class="btn btn-default" ng-click="favorite()" ng-transclude> \
                        <span class="glyphicon glyphicon-heart" ></span> \
                    </button> \
                </div> \
                <div class="col-xs-1" ng-hide="authenticated"></div> \
                <div class="col-xs-3">{{place.geoData.distance | number}} mi</div> \
                <div class="col-xs-3">Crowd: {{place.crowdScore | number}}</div> \
                <div class="col-xs-3">Quiet Level: {{place.quietlevelScore | number}}</div> \
                </p> \
            </div> \
        </div>';
    return {
        restrict: 'A',
        replace: true,
        require: '^ngModel',
        template: placeTemplate,
        transclude: true,
        link: function(scope, element, attrs){
            if(scope.place.image.id !== ''){
                element.find('img').replaceWith($.cloudinary.image(scope.place.image.id, 
                          { format: scope.place.image.format, version: scope.place.image.version, 
                            crop: 'fill', width: 100, height: 100 }));
                    element.find('img').addClass('img-circle');
            }
            scope.$watch(attrs.ngModel, function(oldVal, newVal){
                if (typeof oldVal === 'undefined' && typeof newVal === 'undefined') {
                    element.replaceWith('');
                }
            }, true);
        }
    };
}]).directive('addPlacePicDiv', ['$rootScope', '$http', 'Session', 'cloudinary', function($rootScope, $http, Session, cloudinary) {
    var placePicTemplate = '<div ng-transclude> \
                              <div class="row"> \
                                <img name="preview" id="preview" src="http://placehold.it/100x100" alt="..." class="img-circle"> \
                              </div> \
                              <div class="row"> \
                              <button class="btn btn-success fileinput-button btn-xs" ng-hide="hasImage"> \
                              <span>Add a picture</span> \
                              <div id="photo-upload-btn" class="photo-upload-btn" cl-upload data="cloudinaryData"/> \
                              </button> \
                              <button class="btn btn-danger fileinput-button btn-xs" ng-show="hasImage" ng-click="removePic()">Remove picture</button> \
                              </div> \
                            </div>';
    return {
        restrict: 'A',
        replace: true,
        template: placePicTemplate,
        transclude: true,
        controller: function($scope, $element, Session){
            $scope.cloudinaryData = {};
            $scope.hasImage = false;
            $scope.imageUploadResult = {};

            var tags = ['PLACE', Session.currentCategory];

            cloudinary.getUploadAttrs(tags, function(data) {

                $scope.cloudinaryData = {
                    url: data.url,
                    formData: data.params,
                    progress : function(e, cloudinaryResponse) { 
                    },
                    start : function(e, cloudinaryResponse){
                        //start progress spinner
                    },
                    done : function(e, cloudinaryResponse) {
                        //end spinner
                        console.log('Done: ');
                        $scope.hasImage = true;
                        $scope.imageUploadResult = cloudinaryResponse.result;
                        $scope.place.image.id = cloudinaryResponse.result.public_id;
                        $scope.place.image.format = cloudinaryResponse.result.format;
                        $scope.place.image.version = cloudinaryResponse.result.version;
                        console.log(cloudinaryResponse);
                    }
                };

                console.log($scope.cloudinaryData);
            });

            $scope.removePic = function(){
                //call image delete
                $scope.hasImage = false;
                $http.delete('/-/api/v1/cloudinary/image/' + $scope.imageUploadResult.public_id)
                    .success(function(data){
                        console.log(data);
                    })
                    .error(function(error) {
                        console.log(error);
                    });
                $scope.imageUploadResult = {};
                $scope.place.imageId = '';
            };
        },
        link: function(scope, element, attrs){
            scope.$watch('hasImage', function(newVal, oldVal) {
                if(scope.hasImage){
                    console.log(element);
                    console.log(element.find('img'));
                    element.find('img').replaceWith($.cloudinary.image(scope.imageUploadResult.public_id, 
                          { format: scope.imageUploadResult.format, version: scope.imageUploadResult.version, 
                            crop: 'fill', width: 100, height: 100 }));
                    element.find('img').addClass('img-circle');
                }else{
                    element.find('img').replaceWith('<img name="preview" id="preview" src="http://placehold.it/100x100" alt="..." class="img-circle"> ');
                }
            });
            //On cancel delete image from Cloudinary
        }
    };
}]);