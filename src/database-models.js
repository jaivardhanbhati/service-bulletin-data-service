/* eslint prefer-rest-params: 0 */
/* Ignoring this lint rule because this library has problems
	when we use lambda style function definitions.
*/
/**
 * Created by 212426224 on 9/18/16.
 */
'use strict';
const knexConfig = require('./knex-config');
const bookshelf = require('bookshelf')(knexConfig);

const ServiceBulletin = bookshelf.Model.extend({
	tableName: 'service_bulletin',
	idAttribute: 'sb_id',
	hasTimestamps: ['created_date', 'last_modified_date'],
	ServiceBulletinAudit: function () {
		return this.hasMany(ServiceBulletinAudit);
	},
	ServiceBulletinATA: function () {
		return this.hasMany(ServiceBulletinATA, 'sb_id', 'sb_id');
	},
	constructor: function () {
		bookshelf.Model.apply(this, arguments);
		this.on('created', function (model, attrs, options) {
			// insert ata association for service bulletin
			if (this.attributes.title) {
				let ataList = (this.attributes.title).match(/[0-9]{2}-[0-9]{2}-[0-9]{2}/g);
				if (ataList) {
					ataList.forEach((ata) => {
						new ServiceBulletinATA({
							sb_id: this.attributes.sb_id,
							sb_number: this.attributes.sb_number,
							sb_version: this.attributes.sb_version,
							ata: ata
						}).save();
					});
				}
			}
		});
		this.on('saved', function (model, attrs, options) {
			const action = (this.attributes.created_date === this.attributes.last_modified_date)
				? 'Create' : 'Update';
			new ServiceBulletinAudit({ sb_id: this.attributes.sb_id,
				sb_number: this.attributes.sb_number,
				sb_version: this.attributes.sb_version,
				user_action: action,
				modified_by: this.attributes.last_modified_by,
				service_bulletin_data: JSON.stringify(this.attributes)
			}).save();
		});
	}
});

const ServiceBulletinAudit = bookshelf.Model.extend({
	tableName: 'service_bulletin_audit',
	hasTimestamps: ['modified_date'],
	ServiceBulletin: function () {
		return this.belongsTo(ServiceBulletin);
	}
});

const ServiceBulletinATA = bookshelf.Model.extend({
	tableName: 'service_bulletin_ata',
	hasTimestamps: ['created_date', 'last_modified_date'],
	constructor: function () {
		bookshelf.Model.apply(this, arguments);
		this.on('saved', function (model, attrs, options) {
			const action = (this.attributes.created_date === this.attributes.last_modified_date)
				? 'Create' : 'Update';
			new ServiceBulletinATAAudit({ ata_id: this.id,
				sb_id: this.attributes.sb_id,
				sb_number: this.attributes.sb_number,
				sb_version: this.attributes.sb_version,
				user_action: action,
				modified_by: this.attributes.last_modified_by,
				service_bulletin_ata_data: JSON.stringify(this.attributes)
			}).save();
		});
	},
	ServiceBulletin: function () {
		return this.belongsTo(ServiceBulletin, 'sb_id', 'sb_id');
	},
	ServiceBulletinATAAudit: function () {
		return this.hasMany(ServiceBulletinATAAudit);
	}
});

const ServiceBulletinATAAudit = bookshelf.Model.extend({
	tableName: 'service_bulletin_ata_audit',
	hasTimestamps: ['modified_date'],
	ServiceBulletinATA: function () {
		return this.belongsTo(ServiceBulletinATA);
	}
});

module.exports = {
	ServiceBulletin: ServiceBulletin,
	ServiceBulletinAudit: ServiceBulletinAudit,
	ServiceBulletinATA: ServiceBulletinATA,
	ServiceBulletinATAAudit: ServiceBulletinATAAudit,
	bookshelf: bookshelf
};
