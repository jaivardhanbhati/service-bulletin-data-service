'use strict';
const models = require('./engine-modules-database-models');
const logger = require('./logger')('EngineModulesDatabaseQueries');

const queries = {
	getEngineModuleHierarchy(criteria) {
		return new Promise((resolve, reject) => {
			let model = new models.EngineModuleHierarchy();
			let qb = model.query();
			if (criteria) qb.where(criteria);
			model.fetchAll()
				.then((modules) => {
					resolve(modules);
				})
				.catch((err) => {
					logger.error('Engine Module Hierarchy fetch by criteria failed.');
					reject(err);
				});
		});
	}
};

module.exports = queries;
