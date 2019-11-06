/* eslint prefer-rest-params: 0 */
/* Ignoring this lint rule because this library has problems
	when we use lambda style function definitions.
*/
'use strict';
const knexConfig = require('./knex-config');
const bookshelf = require('bookshelf')(knexConfig);

const EngineModuleHierarchy = bookshelf.Model.extend({
	tableName: 'engine_module_hierarchy',
	idAttribute: 'id',
	hasTimestamps: ['created_date', 'last_modified_date'],
	EngineModuleHierarchyAudit: function () {
		return this.hasMany(EngineModuleHierarchyAudit);
	},
	constructor: function () {
		bookshelf.Model.apply(this, arguments);
		this.on('saved', function (model, attrs, options) {
			const action = (this.attributes.created_date === this.attributes.last_modified_date)
				? 'Create' : 'Update';
			new EngineModuleHierarchyAudit({ engine_family: this.attributes.engine_family,
				module_id: this.attributes.module_id,
				version: this.attributes.version,
				user_action: action,
				engine_module_data: this.attributes.engine_module_data,
				modified_by: this.attributes.last_modified_by
			}).save();
		});
	}
});

const EngineModuleHierarchyAudit = bookshelf.Model.extend({
	tableName: 'engine_module_hierarchy_audit',
	hasTimestamps: ['modified_date'],
	EngineModuleHierarchy: function () {
		return this.belongsTo(EngineModuleHierarchy);
	}
});

module.exports = {
	EngineModuleHierarchy: EngineModuleHierarchy,
	EngineModuleHierarchyAudit: EngineModuleHierarchyAudit
};
