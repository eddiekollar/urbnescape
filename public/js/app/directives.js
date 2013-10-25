'use strict';

/* Directives */


angular.module('urbnEscape.directives', [])
.directive('map', ['$http', 'Session', function($http, Session) {
    return {
        restrict: 'A',
        replace: false,
        transclude: true,
        scope: {
            place: '=',
            mode: '@'
        },
        controller: function($scope){
            //$scope.place = Session.place;

            var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/96818/256/{z}/{x}/{y}.png',
                cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
                map = new L.Map('map', {layers: [cloudmade], zoom: 14 }),
                latLngs = [],
                path, startMarker, finishMarker,
                marker = new L.marker();

            map.doubleClickZoom.disable();

            if($scope.mode === 'view'){
                latLngs = $scope.place.geoData.latLngs;
                if($scope.place.geoData.layerType === 'marker'){
                    marker = L.marker(latLngs[0]).addTo(map);
                    map.setView(latLngs[0], 14);
                }else{
                    path = L.polyline($scope.place.geoData.latLngs).addTo(map);
                    map.fitBounds(path.getBounds());
                    startMarker = L.marker(latLngs[0]).addTo(map);
                    finishMarker = L.marker(latLngs[latLngs.length - 1]).addTo(map);
                }
            }else if($scope.mode === 'edit'){
                map.on('locationfound', function(e) {
                    marker = L.marker(e.latlng).addTo(map);
                });
                map.on('locationerror', function(e) {
                    console.log(e.message);
                });

                var editableLayers = new L.FeatureGroup();
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

                var GetData = function (latlng) {
                    var parameters = L.Util.extend({
                        format: 'json',
                        lat: latlng.lat,
                        lon: latlng.lon,
                        zoom: 18,
                        addressdetails: 1
                    });

                    $scope.$apply(
                    $http.get('http://nominatim.openstreetmap.org/reverse' + L.Util.getParamString(parameters)).
                        success(function(data) {
                            var location = '';
                            if(data.address.road){
                                location += data.address.road + " ";
                            }
                            if(data.address.city){
                                location += data.address.city + ", ";
                            }if(data.address.state){
                                location += data.address.state;
                            }
                            $scope.place.location = location;
                        }));
                };

                map.on('draw:drawstart', function (e) {
                    var type = e.layerType;

                    map.removeLayer(marker);

                    if(type === 'marker'){
                    }else if(type === 'polyline'){
                        editableLayers.clearLayers();
                    }
                });

                map.on('draw:created', function (e) {
                    var type = e.layerType,
                        layer = e.layer,
                        latLngs = [];

                    function cleanObj(obj) {
                        return {lat: obj.lat, lon: obj.lng};
                    }

                    if (type === 'marker') {
                        editableLayers.clearLayers();
                        latLngs = [cleanObj(layer.getLatLng())];
                        marker = e.layer;
                        marker.on('dragend', function(e){
                            latLngs = [cleanObj(e.target.getLatLng())];
                            $scope.place.geoData.latLngs = latLngs;
                            GetData(latLngs[0]);
                        });

                        layer.options.draggable = true;
                    }else if(type==='polyline'){
                        angular.copy(layer.getLatLngs(), latLngs);
                        latLngs = latLngs.map(cleanObj);
                    }
                    editableLayers.addLayer(layer);
                    $scope.place.geoData.latLngs = latLngs;
                    $scope.place.geoData.layerType = type;

                    GetData(latLngs[0]);
                });

                map.locate({setView: true});
            }else if($scope.mode === 'directions'){
                var southwest = new L.LatLng($scope.$parent.bounds.southwest.lat, $scope.$parent.bounds.southwest.lng);
                var northeast = new L.LatLng($scope.$parent.bounds.northeast.lat, $scope.$parent.bounds.northeast.lng);
                var bounds = new L.LatLngBounds(southwest, northeast);
                map.fitBounds(bounds);

                latLngs.push($scope.$parent.steps[0].start_location);
                latLngs.push($scope.$parent.steps[0].end_location);
                for (var i = 1; i <= $scope.$parent.steps.length - 1; i++) {
                    latLngs.push($scope.$parent.steps[i].end_location);
                };
                path = L.polyline(latLngs).addTo(map);

                startMarker = L.marker(latLngs[0]).addTo(map);
                finishMarker = L.marker(latLngs[latLngs.length - 1]).addTo(map);
                //prevent zoom out from bounds
                //make sure bounds are 
                //map.fitBounds();

            }
        },
        link: function(scope, element, attrs) {

        }
    };
}]).directive('ngFocus', [function() {
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
    var placeTemplate = '<div class="panel col-12" ng-controller="PlaceCtrl" ng-transclude> \
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
                <div class="col-xs-3" ng-switch on="authenticated"> \
                    <button favorite-button place-id="place._id" class="btn btn-default" ng-click="favorite()" ng-switch-when="true" ng-transclude> \
                        <span class="glyphicon glyphicon-heart" ></span> \
                    </button> \
                </div> \
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
                              <div class="row" ng-show="editMode"> \
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
            $scope.hasImage = ((typeof $scope.place.image.id !== 'undefined') && ($scope.place.image.id !== '')) || false;
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
                    }
                };
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
                    element.find('img').replaceWith($.cloudinary.image(scope.place.image.id, 
                          { format: scope.place.image.format, version: scope.place.image.version, 
                            crop: 'fill', width: 100, height: 100 }));
                    element.find('img').addClass('img-circle');
                }else{
                    element.find('img').replaceWith('<img name="preview" id="preview" src="http://placehold.it/100x100" alt="..." class="img-circle"> ');
                }
            });
            //On cancel delete image from Cloudinary
        }
    };
}]).directive('placeForm', ['$rootScope', '$http', function($rootScope, $http) {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            place: '=',
            context: '@'
        },
        templateUrl: '/public/partials/placeForm.html',
        controller: function($scope, $element, $attrs){
            $scope.categories = ['VIEW', 'PARK', 'PATH', 'SOLITUDE'];
            $scope.editMode = true;
            //Copy the original place object in case of cancel
            $scope.originalObj = angular.copy($scope.place);

            if($scope.context === 'placeDetails'){
                $scope.editMode = false;
            }

            $scope.delete = function(){
                //delete place
            };

            $scope.setEditMode = function(){
                $scope.editMode = true;
            };

            $scope.cancel = function() {
                $scope.editMode = false;
                $scope.place = $scope.originalObj;
            };

            $scope.save = function(){
                //save changes
                $scope.editMode = false;
                
                if(!angular.equals($scope.place, $scope.originalObj)){
                    $http.put('/-/api/v1/places/', {place: $scope.place}).
                    success(function(data) {
                        $scope.place = data;
                    }).error(function(error) {
                        $scope.errorMessage = error.message;
                        console.log(error);
                    });
                }
            };
        },
        link: function(scope, element, attrs){
            if(scope.context === 'placeDetails'){
                element.find('input').attr('disabled', 'disabled');
                element.find('textarea').attr('disabled', 'disabled');
            }
            scope.$watch('editMode', function(newVal, oldVal){
                if(newVal){
                    element.find('input').removeAttr('disabled');
                    element.find('textarea').removeAttr('disabled');
                }else{
                    element.find('input').attr('disabled', 'disabled');
                    element.find('textarea').attr('disabled', 'disabled');
                }
            });
        }
    };
}]).directive('backButton', ['$location', function($location) {
    return {
        restrict: 'A',
        replace: false,
        controller: function($scope){
            $scope.showButton = function() {
                var path = $location.path();
                return (path !== '/placesView');
            };
        },
        link: function(scope, element, attrs){
            element.bind('click', function(evt){
                history.back();
                scope.$apply();
            });
        }
    };
}]).directive('activityTable', [function() {
    return {
        restrict: 'A',
        replace: true,
        template: '<div><div ng-click="toggleShowActivities()"><img src="/public/img/x1/icon_activities.png"/><span ng-show="context === \'edit\'">SELECT</span> ACTIVITIES \
            <span class="glyphicon pull-right"></span></div> \
            <div ng-show="showActivities"> \
                  <table class="table"> \
                      <tbody> \
                      </tbody> \
                  </table> \
            </div></div>',
        scope: {
          place: '=',
          context: '@'
        },
        controller: function($scope, $element) {
            console.log($scope.context);
            $scope.showActivities = ($scope.context === 'edit');

            $scope.toggleShowActivities = function() {
                if($scope.context === 'view'){
                    $scope.showActivities = !$scope.showActivities;
                }
            };

            $scope.changeActivityStatus = function(){
                console.log($element);
                /*
                if($scope.place.activities.indexOf(activity) >= 0){
                    //remove
                }else{
                    $scope.place.activities.push(activity);
                }*/
            };
        },
        link: function(scope, element, attrs){
            var activities = ['beachball', 'bench', 'bike', 'birdwatching', 'hike', 'jog', 'magic', 'pets', 'playground', 'read', 'sit', 'sleep', 'sports', 'surf',
                              'swim', 'walk', 'yoga'];

            var numActivities = activities.length;
            var maxCols = 6;

            var tableElem = element.find('table');
            for( var i =0 ; i < (numActivities/maxCols);i++){
              tableElem.append('<tr>');
              for( var j =0 ; j < maxCols;j++){
                  //$scope.activities[i][j] = activities.shift();
                if(activities.length > 0) {
                    var activity = activities.shift();
                    if(scope.place.activities.indexOf(activity) >= 0){
                        element.find('tbody').append('<td><img id=' + activity + ' src="/public/img/x1/icon_' + activity + '_orange.png"/></td>');
                    }else{
                        element.find('tbody').append('<td><img id=' + activity + ' src="/public/img/x1/icon_' + activity + '_gray.png"/></td>');
                    }
                }
              }
              tableElem.append('</tr>');
            }

            if(scope.context === 'edit'){
                var img  = element.find('tbody').find('img');
                console.log(img);
                img.css('cursor','pointer');
                img.bind('click', function(event){
                    var activity = event.target.id;
                    if(scope.place.activities.indexOf(activity) < 0){
                        event.target.src='/public/img/x1/icon_' + activity + '_orange.png';
                        scope.place.activities.push(activity);
                    }else{
                        event.target.src='/public/img/x1/icon_' + activity + '_gray.png';
                        scope.place.activities.splice(scope.place.activities.indexOf(activity), 1);
                    }
                });
                //img add on click attribute
            }

            scope.$watch('showActivities', function(newVal, oldVal){
                if(scope.context === 'view'){
                    if(newVal){
                        element.find('span').removeClass('glyphicon-chevron-right');
                        element.find('span').addClass('glyphicon-chevron-down');
                    }else{
                        element.find('span').removeClass('glyphicon-chevron-down');
                        element.find('span').addClass('glyphicon-chevron-right');
                    }
                }
            });
        }
    };
}]);