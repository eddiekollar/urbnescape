
var express     = require('express'),
     MongoStore = require('connect-mongo')(express)
    , mongoose  = require('mongoose')
    , path      = require('path')
    , passport  = require('passport')
    , config    = require('./config')
    , auth      = require('./routes/auth')
    , user      = require('./routes/user')
    , session   = require('./routes/session')
    , places    = require('./routes/places')
    , review    = require('./routes/reviews');

var API_BASE_URL = '/-/api/v1';
var AUTH_URL = '/-/auth';

var app = exports.app = express();
var logger   = require('./lib/logging')(app.settings.env);

app.configure(function(){
    app.set('client-facebook-signup-path', '/facebook?action=signup');
    app.set('client-facebook-signin-path', '/facebook?action=signin');
    app.set('dbUrl', config.db[app.settings.env]);
     var mongodb = mongoose.connect(app.get('dbUrl'),{server:{poolSize:2}});
    app.use(express.logger('dev'));
    //app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        cookie: { path: '/', httpOnly: false, maxAge: null },
        secret:'secret',
        store: new MongoStore(
        {//url:  app.get('dbUrl')
            mongoose_connection: mongodb.connections[0]
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use('/public', express.static(__dirname + '/public'));
});

app.configure('production', function () {

});

app.configure('development', function () {
    app.use(express.errorHandler());
});

/*
app.configure('test', function () {
    var opts = { server: { auto_reconnect: false } };
    mongoose.connect(app.get('dbUrl'), opts);
});
*/

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.send(401, 'Not Authorized');
}

// auth
app.get(AUTH_URL + '/logout', auth.logout);

app.post(AUTH_URL + '/login', auth.login);
app.get(AUTH_URL +'/facebook/login', auth.fblogin);
app.get(AUTH_URL + '/facebook/callback', auth.fbcallback);
app.get(AUTH_URL + '/loggedin', auth.loggedin);

app.get(API_BASE_URL + '/user', user.list);
app.post(API_BASE_URL + '/user', user.create);
app.get(API_BASE_URL + '/user/me/', ensureAuthenticated, user.current);
app.get(API_BASE_URL + '/user/:userId', ensureAuthenticated, user.read);
app.put(API_BASE_URL + '/user/', ensureAuthenticated, user.update);
app.delete(API_BASE_URL + '/user/:userId', ensureAuthenticated, user.delete);

app.post(API_BASE_URL + '/check/:uniqueField', user.unique);


//TODO: Fix places calls
app.get(API_BASE_URL + '/places', places.findAll);
app.get(API_BASE_URL + '/places/:placeId', places.findById);
app.get(API_BASE_URL + '/places/category/:category', places.findByCategory);
app.post(API_BASE_URL + '/places', places.addPlace);


//API calls for reviews
app.get(API_BASE_URL + '/reviews/:placeId', review.findByPlaceId);
app.get(API_BASE_URL + '/reviews/me/:placeId', ensureAuthenticated, review.findByUserAndPlaceId);
//app.get(API_BASE_URL + '/reviews/me/', review.findByUser);
app.post(API_BASE_URL + '/reviews', review.create);
app.put(API_BASE_URL + '/reviews/:reviewId', review.update);
app.delete(API_BASE_URL + '/reviews/:reviewId', review.delete);

//API calls for favorites
app.get(API_BASE_URL + '/favorites/ids/:userId', user.favoritesIds);
app.post(API_BASE_URL + '/favorites', user.addFavorite);
app.delete(API_BASE_URL + '/favorites/:userId/:placeId', user.deleteFavorite);

/*
 app.get(API_BASE_URL + '/reviews/:tipId', tips.read);
 app.get(API_BASE_URL + '/favorites/:favoriteId', favorites.getCountById);

//API calls for recent
 app.get(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.findByUserId);
 app.post(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.add);
 app.delete(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.delete);
 */

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 5000);
