'use strict';
const dbMigrate = require('db-migrate');

const run = (callback) => {
	const api = dbMigrate.getInstance(true);
	api.up(callback);
};

module.exports = {
	run: run
};
