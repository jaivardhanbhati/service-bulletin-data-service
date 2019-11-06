'use strict';
const express = require('express');
const engineModulesRouter = express.Router();
const logger = require('./logger')('EngineModulesDataManager');
const dbQueries = require('./engine-modules-database-queries');
const _ = require('lodash');

// Maintain a local cache for performance
// Will work as long as NO create/update/delete oprations are in place
let moduleByFamilyCache = {};

const handleError = (err, res) => {
	logger.error('Error', err, err.stack);
	if (res) {
		if (err.status || err.statusCode) {
			logger.error('Setting status', err.status || err.statusCode);
			res.status(err.status || err.statusCode);
		} else {
			res.status(500);
		}
		res.json({ errorMessage: err.message });
	}
};

/**
*	Returns all engine modules in hierarchical structure,
* 	for the specified family of the engine in the request path.
**/
const getEngineModulesByFamily = (req, res, next) => {
	try {
		let criteria = {};
		if (req.params.id) {
			criteria.engine_family = req.params.id;
		} else {
			let err =
				new Error('No engine family id specified as path parameter to get hierarchy.');
			err.status = 400;
			handleError(err, res);
		}
		if (moduleByFamilyCache[criteria.engine_family]) {
			logger.info('From local cache.');
			res.json(moduleByFamilyCache[criteria.engine_family]);
		} else {
			logger.info('Not available in local cache. Will fetch and update.');
			dbQueries.getEngineModuleHierarchy(criteria)
				.then((engineModules) => {
					if (engineModules &&
						engineModules.toJSON().length > 0) {
						engineModules = engineModules.toJSON();
						// group modules by module_id
						const moduleGroups = _.groupBy(engineModules, 'module_id');
						const grandModule = _.minBy(engineModules, 'module_id');

						let moduleMap = {};
						moduleMap = Object.keys(moduleGroups).map((key) => {
							// get only the latest version, if mutiple versions exist
							const module = _.maxBy(moduleGroups[key], 'version');
							return {
								moduleId: module.module_id,
								moduleNumber: module.module_number,
								moduleName: module.module_name,
								ata: module.ata,
								parentModuleId: module.parent_module_id,
								partNumberPattern: module.part_number_pattern
							};
						}).reduce((moduleMap, module) => {
							// Organize the modules as parent & children
							moduleMap[module.moduleId] = module;
							if (moduleMap[module.parentModuleId]) {
								moduleMap[module.parentModuleId]['children'] =
									moduleMap[module.parentModuleId]['children'] || [];
								moduleMap[module.parentModuleId]['children'].push(module);
							}
							return moduleMap;
						}, moduleMap);
						// This will be the response structure
						let moduleStructure = {
							family: criteria.engine_family,
							createdBy: engineModules[0].created_by,
							lastModifiedBy: engineModules[0].last_modified_by,
							createdDate: engineModules[0].created_date,
							lastModifiedDate: engineModules[0].last_modified_date,
							hierarchy: moduleMap[grandModule.module_id]
						};
						moduleByFamilyCache[criteria.engine_family] = moduleStructure;
						res.json(moduleStructure);
					} else {
						let err =
							new Error('No data found.');
						err.status = 204;
						handleError(err, res);
					}
				}).catch((err) => {
					handleError(err, res);
				});
		}
	} catch (err) {
		handleError(err);
	}
};

engineModulesRouter.get('/family/:id', getEngineModulesByFamily);

module.exports = {
	engineModulesRouter: engineModulesRouter
};
