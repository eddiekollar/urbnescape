/**
 * Created with JetBrains WebStorm.
 * User: eddie
 * Date: 8/6/13
 * Time: 12:31 PM
 * To change this template use File | Settings | File Templates.
 */

var express = require("express")
    , path = require('path')
    , places = require('./routes/places');

var app = express();

app.use(express.logger());
app.use(express.bodyParser());

app.configure(function(){
    app.use('/public', express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/places', places.findAll);
app.get('/places/:id', places.findById);

app.post('/places', places.addPlace);

/*
    Add authentication
    Add data validation
 */

app.listen(3000);
