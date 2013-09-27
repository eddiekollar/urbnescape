var winston    			= require('winston')
	, winstonMongodb    = require('winston-mongodb').MongoDB
	, config    		= require('../config');

module.exports = function(env){
	var logTransports = [];

	if (env == 'production') {
		//todo: setup to take config data
		logTransports.push(new (winston.transports.MongoDB({ db: 'db', level: 'info'})));
	}
	else {
	    logTransports.push(new winston.transports.Console({ level: 'debug' }));
		logTransports.push(new winston.transports.MongoDB({ db: 'urbnescape', level: 'info'}));
	    logTransports.push(new winston.transports.File({ filename: 'logs/logfile.log', level: 'debug' }));
	}

	var logger = new (winston.Logger)({
	  transports: logTransports
	});

	logger.log('debug', 'Logging setup for: ' + env);

	return logger;
}
/*
 var logger = new (winston.Logger)({
    transports: [
      new winston.transports.Console()
      new winston.transports.File({ filename: 'path/to/all-logs.log' })
      new winston.transports.Couchdb({ 'host': 'localhost', 'db': 'logs' })
      new winston.transports.Riak({ bucket: 'logs' })
      new winston.transports.MongoDB({ db: 'db', level: 'info'})
    ]
    exceptionHandlers: [
      new winston.transports.File({ filename: 'path/to/exceptions.log' })
    ]
  });
*/