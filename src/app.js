// Load environment values first
require('./env');
const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const dbMigrateAPI = require('./db-migrate-api');
const logger = require('./logger')('ServiceBulletinApp');
const serviceBulletinManager = require('./service-bulletin-manager');
const schedule = require('node-schedule');

const PORT = process.env.PORT || 8000;

const app = express();
// had to increase the payload size limit to enable service bulletin upload
app.use(bodyParser.json({ limit: '1mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true })); // support encoded bodies

// Secure ALL THE THINGS!!!
app.use(require('helmet')({}));
// Enforce UAA
app.use(require('./enforcer'));

const runDBMigrations = (callback) => {
	dbMigrateAPI.run((err) => {
		if (err) {
			logger.error(err.originalErr);
			callback(err);
		}
		callback(null, 'success');
	});
};

// Runs Service bulletin job at 11pm every night
schedule.scheduleJob('0 0 23 * * *', () => {
	serviceBulletinManager.loadServiceBulletins();
});

async.waterfall([
	// 1. Run DB Migrations
	runDBMigrations
], (err, result) => {
	if (err) {
		throw err.originalErr;
	} else {
		const serviceBulletinManager = require('./service-bulletin-manager');
		const engineModulesManager = require('./engine-modules-data-manager');
		// importing data handlers
		app.use('/api/v1/servicebulletins', serviceBulletinManager.serviceBulletinRouter);
		app.use('/api/v1/modules/engines', engineModulesManager.engineModulesRouter);
		// launch express
		app.listen(PORT, () => {
			console.log('Service Bulletin Data Service listening on port ' + PORT + '!');
		});
	}
});

module.exports = app;
