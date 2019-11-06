'use strict';
const express = require('express');
const serviceBulletinRouter = express.Router();
const logger = require('./logger')('ServiceBulletinManager');
const dbQueries = require('./database-queries');
const externalDataServicesCred = require('./env');
const authService = require('./service-auth-client');
const request = require('request');
const _ = require('lodash');

const SERVICE_CALL_TIMEOUT = 50000;
// Use a socket pool for outgoing requests
const pool = { maxSockets: 30 };

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

const getServiceBulletins = (req, res, next) => {
	try {
		// if no criteria is specified, returns all instruction templates
		let criteria = {};
		if (req.params.id) criteria.sb_id = req.params.id;
		else if (req.query.engineModel) criteria.engine_model = req.query.engineModel;
		dbQueries.getServiceBulletin(criteria)
			.then((serviceBulletins) => {
				// group service bulletins by sb_number
				let sbGroups = _.groupBy(serviceBulletins.toJSON(), 'sb_number');
				let sbList = [];
				// get only the latest version for every service bulletin
				_.each(sbGroups, (sb) => {
					sbList.push(_.maxBy(sb, 'sb_version'));
				});
				res.json(sbList);
			})
			.catch((err) => {
				handleError(err, res);
			});
	} catch (err) {
		handleError(err);
	}
};

const getServiceBulletinsAta = (req, res, next) => {
	try {
		let criteria = {};
		if (req.params.engineModel) {
			criteria.engine_model = req.params.engineModel;
		}
		let promiseArray = [];
		promiseArray.push(getAtaSBForEngineModel(criteria));
		promiseArray.push(getSBForESN(req.params.esn));
		Promise.all(promiseArray)
			.then((response) => {
				let sbCommon = [];
				if (response[0] && response[1] && response[1].sbDetails) {
					// SB list from the DB for the given model
					const sbList = response[0];
					// Sb list from SB data service for given ESN
					const sbEsnList = response[1].sbDetails;
					// Common SBs between DB and dataservice
					const intersectSbNumbers = _.intersectionWith(_.map(sbList, 'sb_number'),
						_.map(sbEsnList, 'sbNumber'), (sb, esnSb) => {
							return `${criteria.engine_model}-${sb}` === esnSb;
						});
					// Above intersection will omit ATAs that have same SB number
					// So need to iterate again and fetch the full list
					_.each(sbList, (sb) => {
						if (_.indexOf(intersectSbNumbers, sb.sb_number) >= 0) {
							sbCommon.push(sb);
						}
					});
				}
				res.json(sbCommon);
			})
			.catch((err) => {
				handleError(err, res);
			});
	} catch (err) {
		handleError(err);
	}
};

const getAtaSBForEngineModel = (criteria) => {
	try {
		let sbList = [];
		return dbQueries.getServiceBulletinAta(criteria)
			.then((serviceBulletinsAtas) => {
				// group service bulletins by sb_number
				let sbGroups = _.groupBy(serviceBulletinsAtas.toJSON(), 'sb_number');
				// get atas associated with only the latest version of service bulletin
				Object.keys(sbGroups).map((key) => {
					const sbMaxVersion = _.maxBy(sbGroups[key], 'sb_version').sb_version;
					_.filter(sbGroups[key], (sb) => {
						return sb.sb_version === sbMaxVersion;
					}).map((maxSb) => {
						sbList.push(maxSb);
					});
				});
				return Promise.resolve(sbList);
			})
			.catch((err) => {
				return Promise.reject(err);
			});
	} catch (error) {
		return Promise.reject(error);
	}
};

const getSBForESN = (esn) => {
	return new Promise((resolve, reject) => {
		try {
			authService.fetchToken(externalDataServicesCred.authServerURL,
			externalDataServicesCred.clientId,
			externalDataServicesCred.clientSecret,
			externalDataServicesCred.scope)
			.then((bearerToken) => {
				// call service bulletin data service for given esn
				request.post({
					uri: externalDataServicesCred.serviceBulletinByEsnUrl,
					body: { esn: esn },
					headers: { ConsumerApp: 'Workscope' },
					timeout: SERVICE_CALL_TIMEOUT,
					json: true,
					pool: pool,
					auth: {
						bearer: bearerToken.access_token
					}
				}, (error, response, body) => {
					if (error) {
						logger.error('Could not retrieve data from bulletin service', error);
						return;
					}
					resolve(body);
				});
			})
			.catch((error) => {
				logger.error('Error while getting auth token', error);
				reject(error);
			});
		} catch (error) {
			reject(error);
		}
	});
};

const getSBEngineModels = (req, res, next) => {
	try {
		const modelList = require('./data/modelList.json');
		if (!modelList) {
			let err =
				new Error('Engine models list not availble');
			err.status = 204;
			handleError(err, res);
			return;
		}
		res.json(modelList);
	} catch (err) {
		handleError(err);
	}
};

const loadServiceBulletinsByModel = (model) => {
	// get bearer token
	authService.fetchToken(externalDataServicesCred.authServerURL,
		externalDataServicesCred.clientId,
		externalDataServicesCred.clientSecret,
		externalDataServicesCred.scope)
		.then((bearerToken) => {
			// call service bulletin data service for give engine model
			request.get({
				uri: `${externalDataServicesCred.serviceBulletinUrl}?modelId=${model}`,
				timeout: SERVICE_CALL_TIMEOUT,
				json: true,
				pool: pool,
				auth: {
					bearer: bearerToken.access_token
				}
			}, (error, response, body) => {
				if (error) {
					logger.error('Could not retrieve data from bulletin service', error);
					return;
				}
				parseAndInsertServiceBulletins(body);
			});
		})
		.catch((error) => {
			logger.error('Error while getting auth token', error);
		});
};

const parseAndInsertServiceBulletins = (serviceBulletins) => {
	try {
		if (serviceBulletins && serviceBulletins.pricingSBDetailsList) {
			let sbList = [];
			serviceBulletins.pricingSBDetailsList.map((sb) => {
				sbList.push({
					sb_number: sb.sbNumber,
					sb_version: Number(sb.revNo),
					title: sb.description ? sb.description : '',
					engine_model: sb.engineModel,
					compliance_category: Number(sb.category),
					active: true,
					created_by: 'JOB',
					last_modified_by: 'JOB'
				});
			});
			_.each(sbList, (sbEntry) => {
				dbQueries.loadServiceBulletin(sbEntry)
					.then((data) => {
						logger.debug('Added sb row', data);
					})
					.catch((err) => {
						logger.error('Error while saving SB', err);
					});
			});
		}
	} catch (error) {
		logger.error('Error while parsing service bulletins', error);
	}
};

const loadServiceBulletinsJob = (req, res, next) => {
	loadServiceBulletins();
	res.json('Job has started!');
};

const loadServiceBulletins = () => {
	const modelList = require('./data/modelList.json');
	try {
		_.each(modelList.models, (model) => {
			loadServiceBulletinsByModel(model);
		});
	} catch (err) {
		handleError(err);
	}
};

const updateServiceBulletin = (req, res, next) => {
	try {
		let errors = [];
		if (!req.params.id || !req.body.sb_id || req.params.id !== req.body.sb_id) {
			errors.push('Service bulletin id is not present ' +
				'or does not match id in request body');
		}
		if (!req.body.sb_number || !req.body.sb_version) {
			errors.push('Service bulletin number and/or version is not present ' +
				'in request body');
		}
		let sbATA = req.body.ServiceBulletinATA ? req.body.ServiceBulletinATA : [];
		sbATA.every((ata) => {
			if (!ata.sb_id || ata.sb_id !== req.body.sb_id) {
				errors.push('Service bulletin id for ATA does not match id ' +
					'in request body');
				// break the loop if there is an error
				return false;
			}
			if (!ata.id) {
				ata.created_by = req.userName || 'ADMIN';
			}
			ata.last_modified_by = req.userName || 'ADMIN';
		});
		if (errors.length > 0) {
			let err = new Error(errors.join());
			err.status = 400;
			handleError(err, res);
			return;
		}
		let sbModel = req.body;
		delete sbModel.ServiceBulletinATA;
		sbModel.last_modified_by = req.userName || 'ADMIN';
		dbQueries.updateServiceBulletin(sbModel, sbATA).then((sb) => {
			res.json(sb);
		}).catch((err) => {
			handleError(err, res);
		});
	} catch (err) {
		handleError(err);
	}
};

const addServiceBulletins = (req, res, next) => {
	try {
		if (req.body) {
			parseAndInsertServiceBulletins(req.body);
			res.json('Started loading Service bulletins!');
		}
	} catch (error) {
		handleError(error);
	}
};

const deleteSBAtaAssociation = (req, res, next) => {
	try {
		if (!req.params.id || !req.params.ataid) {
			let error = new Error('Service bulletin/ATA id missing in request url');
			handleError(error, res);
		} else {
			dbQueries.deleteSBAtaAssociation(req.params.id, req.params.ataid)
				.then((sbAta) => {
					res.status(204).send();
				})
				.catch((err) => {
					handleError(err, res);
				});
		}
	} catch (error) {
		handleError(error);
	}
};

serviceBulletinRouter.post('/job', loadServiceBulletinsJob);
serviceBulletinRouter.post('/', addServiceBulletins);
serviceBulletinRouter.get('/enginemodels', getSBEngineModels);
serviceBulletinRouter.get('/engine/:engineModel/:esn/ata', getServiceBulletinsAta);
serviceBulletinRouter.get(['/', '/:id'], getServiceBulletins);
serviceBulletinRouter.put('/:id', updateServiceBulletin);
serviceBulletinRouter.delete('/:id/ata/:ataid', deleteSBAtaAssociation);

module.exports = {
	serviceBulletinRouter: serviceBulletinRouter,
	loadServiceBulletinByModel: loadServiceBulletinsByModel,
	loadServiceBulletins: loadServiceBulletins
};
