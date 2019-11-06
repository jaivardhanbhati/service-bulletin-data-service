'use strict';

const debug = require('debug');

module.exports = (label, app) => {
	app = app || 'app';
	const log = {
		error: debug(`${app}:${label}:error`),
		info: debug(`${app}:${label}:info`),
		debug: debug(`${app}:${label}:debug`)
	};

	// Configure info, debug log to go to stdout
	log.info.log = console.log.bind(console);
	log.debug.log = console.log.bind(console);

	// Configure error log to go to stdout
	// To use stderr, change to console.error
	log.error.log = console.log.bind(console);

	return log;
};
