/**
 * Created by 212426224 on 9/18/16.
 */
'use strict';
const models = require('./database-models');
const logger = require('./logger')('DatabaseQueries');
const _ = require('lodash');

const queries = {
	getServiceBulletin(criteria) {
		return new Promise((resolve, reject) => {
			let model = new models.ServiceBulletin();
			let qb = model.query();
			if (criteria) qb.where(criteria);
			model.fetchAll({
				withRelated: {
					ServiceBulletinATA: (sbAta) => {
						sbAta.orderBy('id', 'asc');
					}
				}
			})
				.then((serviceBulletins) => {
					resolve(serviceBulletins);
				})
				.catch((err) => {
					logger.error('Service bulletin fetch failed');
					reject(err);
				});
		});
	},
	getServiceBulletinAta(criteria) {
		return new Promise((resolve, reject) => {
			let model = new models.ServiceBulletinATA();
			let qb = model.query();
			qb.innerJoin('service_bulletin', function () {
				this.on('service_bulletin_ata.sb_id', '=', 'service_bulletin.sb_id')
					.andOn('service_bulletin.engine_model', '=',
						models.bookshelf.knex.raw(`'${criteria.engine_model}'`));
			});
			model.fetchAll({ withRelated: ['ServiceBulletin', {
				ServiceBulletin: function (qb) {
					qb.where(criteria);
				}
			}] })
			.then((serviceBulletinsAta) => {
				resolve(serviceBulletinsAta);
			})
			.catch((err) => {
				logger.error('Service bulletin ATA fetch failed');
				reject(err);
			});
		});
	},
	loadServiceBulletin(sbModel) {
		return new Promise((resolve, reject) => {
			new models.ServiceBulletin(sbModel)
				.save()
				.then((sb) => {
					resolve(sb);
				})
				.catch((err) => {
					logger.error('Service Buletins upload failed', err);
					// currenlty unique constraint is used to make sure
					// existing SBs are not re-inserted
					return Promise.reject(err).catch(() => { return {}; });
				});
		});
	},

	updateServiceBulletin(sbModel, sbATA) {
		return new Promise((resolve, reject) => {
			let promiseArray = [];
			_.each(sbATA, (ata) => {
				promiseArray.push(new models.ServiceBulletinATA(ata).save(ata));
			});
			// First persist all ATA changes and then update related Service bulletin
			Promise.all(promiseArray)
				.then(() => {
					new models.ServiceBulletin()
						.where({ sb_id: sbModel.sb_id, sb_number: sbModel.sb_number,
							sb_version: sbModel.sb_version })
						.save(sbModel, { patch: true })
						.then((sb) => {
							// Bookshelf save wasn't returning all fields as response.
							// Need to do a fetch after the save
							resolve(sb
								? sb
								.clear()
								.set({ sb_id: sbModel.sb_id,
									sb_number: sbModel.sb_number,
									sb_version: sbModel.sb_version })
								.fetch({
									withRelated: {
										ServiceBulletinATA: (sbAta) => {
											sbAta.orderBy('id', 'asc');
										}
									}
								})
								: sb);
						})
						.catch((err) => {
							logger.error('Service bulletin save failed', err);
							reject(err);
						});
				})
				.catch((err) => {
					logger.error('Service bulletin ATA save failed', err);
					reject(err);
				});
		});
	},
	deleteSBAtaAssociation(sbId, ataId) {
		return models.bookshelf.transaction((transaction) => {
			return new Promise((resolve, reject) => {
				// first fetch the sb ata record
				new models.ServiceBulletinATA()
					.where({ sb_id: sbId, id: ataId })
					.fetch()
					.then((sbAta) => {
						// create an audit record with the fetched sb ata record info
						new models.ServiceBulletinATAAudit({ ata_id: sbAta.attributes.id,
							sb_id: sbAta.attributes.sb_id,
							sb_number: sbAta.attributes.sb_number,
							sb_version: sbAta.attributes.sb_version,
							user_action: 'Delete',
							modified_by: sbAta.attributes.last_modified_by,
							service_bulletin_ata_data: JSON.stringify(sbAta.attributes)
						}).save(null, { transacting: transaction })
						.then((sb) => {
							// finally delete the ata association
							// audit and delete are part of a transaction to make sure
							// we have a record of the row being deleted
							new models.ServiceBulletinATA()
								.where({ sb_id: sbId, id: ataId })
								.destroy({ transacting: transaction })
								.then((sbAta) => {
									resolve(sbAta);
								})
								.catch((err) => {
									logger.error(`Service Buletins ata
									association delete failed`, err);
									reject(new Error(`Service Buletins ata
									association delete failed`));
								});
						})
						.catch((err) => {
							logger.error('Service bulletin ata association audit failed', err);
							reject(new Error('Service bulletin ata association audit failed'));
						});
					})
					.catch((err) => {
						logger.error('Service bulletin ata association not found', err);
						reject(new Error('Service bulletin ata association not found'));
					});
			});
		});
	}
};

module.exports = queries;
