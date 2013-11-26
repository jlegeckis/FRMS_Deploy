var fs = require('fs'),
    path = require('path');

module.exports.configure = function (env) {
      return JSON.parse(loadJSONConfig(env));
};

var loadJSONConfig = function (env) {
	var filePath;
	filePath = __dirname + '/' + env + 'config.json';

	return fs.readFileSync(filePath, 'UTF-8');
};
