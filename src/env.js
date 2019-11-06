'use strict';
const _ = require('lodash');

// Read all the required environment variables for the application

// Data services details
const dataStoreName = process.env.DATA_SERVICE_NAME || 'postgres';
const dataStoreInstanceName = process.env.DATA_STORE_NAME || 'aviation-service-bulletin-postgres';
const dataServicesInstanceName =
	process.env.DATA_SERVICES_INSTANCE_NAME || 'service-bulletin-creds';
const vcapServices = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : {};

const dataStoreCreds = _.find(vcapServices[dataStoreName], (s) => {
	return s.name === dataStoreInstanceName;
});

const externalDataServicesCred = _.find(vcapServices['user-provided'], (s) => {
	return s.name === dataServicesInstanceName;
});

process.env.DATABASE_URL = dataStoreCreds.credentials.uri;

module.exports = externalDataServicesCred.credentials;
