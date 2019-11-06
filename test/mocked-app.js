'use strict';
const proxyquire = require('proxyquire');

// This file will wrap app.js to mock out any dependencies
process.env.VCAP_SERVICES = JSON.stringify(require('./vcap.json'));
process.env.CONFIG_SERVICE_NAME = 'test-acs-config';
process.env.uaaClientCredentials = 'test-acs-config';
process.env.DATA_STORE_NAME = 'aviation-service-bulletin-postgres';
process.env.DATA_SERVICE_NAME = 'postgres';
process.env.DATA_SERVICES_INSTANCE_NAME = 'service-bulletin-creds';

// Mock Knex
const mockKnex = require('mock-knex');
const knex = require('../src/knex-config');
mockKnex.mock(knex, 'knex@0.11');

// Mock db migrate
var dbMigrateStub = { };
dbMigrateStub.run = (callback) => {
	callback();
};

const app = proxyquire('../src/app', {
	'./enforcer': (req, res, next) => { req.decoded = {}; next(); },
	'./db-migrate-api': dbMigrateStub
});

module.exports = app;
