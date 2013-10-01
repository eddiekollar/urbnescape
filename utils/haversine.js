var haversine = (function() {

  // convert to radians
  var toRad = function(num) {
    return num * Math.PI / 180;
  };

  return function haversine(start, end, options) {
    var miles = 3960;
    var km    = 6371;
    options   = options || {};

    var R = options.unit === 'km' ? km : miles;

    var dLat = toRad(end.lat - start.lat);
    var dLon = toRad(end.lon - start.lon);
    var lat1 = toRad(start.lat);
    var lat2 = toRad(end.lat);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    if (options.threshold) {
      return options.threshold > (R * c);
    } else {
      return R * c;
    }
  };

})();

module.exports = haversine;