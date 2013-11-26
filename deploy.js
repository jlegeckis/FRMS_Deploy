var mongoose = require ("mongoose"); 
var restify = require ("restify");
var deploySchema = new mongoose.Schema({
	release: { type: String, trim: true },
	datestamp: { type: Number, min: 0 },
	md5: { type: String },
	location: { type: String },
	codebase: { type: String },
	server: { type: String },
	success: { type: Number },
	environment: { type: String },
});
// Get environment currently running under
var env = "live";
// // create our configuration object by calling configure based on the environment desired.
var config = require('./config.js').configure(env);

var deployment = mongoose.model('Deployments', deploySchema);
	
function respond(req, res, next) {
	console.log(req.params);	
	if (req.params.server === undefined) {
	    return next(new restify.InvalidArgumentError('Server must be supplied'))
  	}
	var options = {upsert: true};
//	var latest=deployment.aggregate([{ $group: {_id: { server: req.params.server }, mostRecent: { $max: "$datestamp"}}}]);
// Do we have one in here already?
	// Creating one user.
	var incomingDeployment = {
		release: req.params.release,
		datestamp: Date.now(),
		md5: req.params.md5,
		location: req.params.location,
  		codebase: req.params.codebase,
		server: req.params.server,
		success: 1,
		environment: req.params.name
	};

	// Saving it to the database.
	deployment.findOneAndUpdate({ server: req.params.server, release: req.params.release, codebase: req.params.codebase }, incomingDeployment, options, function (err) {
		if (err) {console.log ('Error on save!')} else {console.log ('Saved!')}
	});
  	res.send('hello ' + req.params.server);
}

function findlatest(server) {
	return deployment.aggregate({key: {"server":1},reduce: function (curr,result) {result.total++; if(curr.datestamp>result.datestamp) { result.datestamp=curr.datestamp;} },initial: {total:0, datestamp: 0} });
}

function listLatestPerServer(req, res, next) {
	console.log("Quering..."+req.params.name);

	deployment.find({ server: req.params.name }, null, { sort: { datestamp: -1 } },function(err, deploys) { res.send(deploys); });
}

function listLatestPerEnvironment(req, res, next) {
	console.log("Quering..."+req.params.name);

	deployment.find({ environment: req.params.name }, null, { sort: { datestamp: -1 }, limit: 1 },function(err, deploys) { res.send(deploys); });
}

function listLatestForAll(req, res, next) {
// This will group by server and release. It will have multiple server entries because each server will have multiple releases.
	//deployment.aggregate([{$project:{server: 1, release: 1, datestamp: 1}},{ $group: { _id: { server: "$server", release: "$release" },  mostRecent: { $max: "$datestamp" } } } ], 
	deployment.aggregate([{$project:{server: 1, release: 1, datestamp: 1}}, { $group: { _id: { server: "$server" },  mostRecent: { $max: "$datestamp" } } } ], 
		function(err, deploys) { res.send(deploys); });
}

var server = restify.createServer();
server.use(restify.bodyParser());
server.get('/latest/server/:name', listLatestPerServer);
server.get('/latest/_all', listLatestForAll);
server.get('/latest/_enviro/:name', listLatestPerEnvironment);
server.get('/deploy/:name', respond);
server.post('/deploy/:name', respond);
server.head('/deploy/:name', respond);

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = 'mongodb://'+config.mongo.server+'/DeployDB';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  	if (err) {
  		console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  	} else {
  		console.log ('Succeeded connected to: ' + uristring);

// Deployment Schema setup, Mongo connected, time to start listening

		server.listen(config.server.port, function() {
		  	console.log('%s listening at %s', server.name, server.url);
		});

	}
});
