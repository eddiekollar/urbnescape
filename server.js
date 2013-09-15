
var express     = require('express')
    , MongoStore = require('connect-mongo')(express)
    , mongoose  = require('mongoose')
    , path      = require('path')
    , passport  = require('passport')
    , config    = require('./config')
    , auth      = require('./routes/auth')
    , user      = require('./routes/user')
    , session   = require('./routes/session')
    , places    = require('./routes/places');

var API_BASE_URL = '/-/api/v1';
var AUTH_URL = '/-/auth';

var app = exports.app = express();

app.configure(function(){
    app.set('dbUrl', config.db[app.settings.env]);
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/public', express.static(__dirname + '/public'));
});

app.configure('production', function () {
 var mongodb = mongoose.connect(app.get('dbUrl'),{server:{poolSize:2}});

 app.use(express.session({
     secret:'secret',
     maxAge: new Date(Date.now() + 3600000),
     store: new MongoStore(
     {//url:  app.get('dbUrl')
     mongoose_connection: mongodb.connections[0]
     })
    }));
});

app.configure('development', function () {
    var mongodb = mongoose.connect(app.get('dbUrl'),{server:{poolSize:2}});
    app.use(express.errorHandler());

    app.use(express.session({
        secret:'secret',
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(
            {//url:  app.get('dbUrl')
             mongoose_connection: mongodb.connections[0]
             })
    }));
});

/*
app.configure('test', function () {
    var opts = { server: { auto_reconnect: false } };
    mongoose.connect(app.get('dbUrl'), opts);
});
*/

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    return res.send(401, 'Not Authorized');
}

// auth
app.get(AUTH_URL + '/logout', auth.logout);

app.post(AUTH_URL + '/login', auth.login);
app.get(AUTH_URL +'/facebook/login', auth.fblogin);
app.get(AUTH_URL + '/facebook/callback', auth.fbcallback);

//app.post(AUTH_URL + '/password', passwordRoutes.list);

app.get(API_BASE_URL + '/user', user.list);
app.post(API_BASE_URL + '/user', user.create);
app.get(API_BASE_URL + '/user/me', user.current);
app.get(API_BASE_URL + '/user/:userId', ensureAuthenticated, user.read);
app.put(API_BASE_URL + '/user/:userId', ensureAuthenticated, user.update);
app.delete(API_BASE_URL + '/users/:userId', ensureAuthenticated, user.delete);


//TODO: Fix places calls
app.get(API_BASE_URL + '/places', places.findAll);
app.get(API_BASE_URL + '/places/:placeId', places.findById);
app.get(API_BASE_URL + '/places/category/:category', places.findByCategory);

app.post(API_BASE_URL + '/places', places.addPlace);

/*
//API calls for tips
 app.get(API_BASE_URL + '/tips/:userId', tips.findByUserId);
 app.get(API_BASE_URL + '/tips/:tipId', tips.read);
 app.get(API_BASE_URL + '/tips/:placeId', tips.findByPlaceId);

 app.post(API_BASE_URL + '/tips', ensureAuthenticated, tips.create);
 app.put(API_BASE_URL + '/tips/:tipId', ensureAuthenticated, tips.update);
 app.delete(API_BASE_URL + '/tips/:tipId', ensureAuthenticated, tips.delete);

//API calls for favorites
 app.get(API_BASE_URL + '/favorites/:userId', ensureAuthenticated, favorites.findByUserId);
 app.get(API_BASE_URL + '/favorites/:favoritesId', favorites.getCountById);

 app.post(API_BASE_URL + '/favorites', ensureAuthenticated, favorites.add);
 app.delete(API_BASE_URL + '/favorites/:tipId', ensureAuthenticated, favorites.delete);

//API calls for recent
 app.get(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.findByUserId);
 app.post(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.add);
 app.delete(API_BASE_URL + '/recent/:userId', ensureAuthenticated, recent.delete);
 */

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 5000);
