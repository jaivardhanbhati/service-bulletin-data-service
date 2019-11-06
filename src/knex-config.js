'use strict';

const knex = require('knex')({
	client: 'postgres',
	connection: process.env.DATABASE_URL,
	debug: false,
	pool: {
		min: process.env.DB_CONNECTION_POOL_MIN || 2,
		max: process.env.DB_CONNECTION_POOL_MAX || 10
	}
});

module.exports = knex;
