'use strict';

const request = require('supertest');
const chai = require('chai');
const app = require('./mocked-app');
const sinon = require('sinon');
const req = require('request');
const bPromise = require('bluebird');
const serviceBulletinManager = require('../src/service-bulletin-manager');
const authService = require('../src/service-auth-client');

const expect = chai.expect;
var tracker = require('mock-knex').getTracker();

describe('Service Bulletin manager', () => {
	beforeEach(() => {
		tracker.install();
		let tokenStub = sinon.stub(authService, 'fetchToken');
		tokenStub.returns(
			bPromise.resolve({
				access_token: 'fHH5ZNutIyCod39g9hp3IKgzu7Im',
				token_type: 'Bearer',
				expires_in: 7199
			}));
	});

	afterEach(() => {
		tracker.uninstall();
		authService.fetchToken.restore();
	});

	describe('When queried for service bulletins by engine model', (query, step) => {
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						const expectedResponse = require('./test-inputs/SB-GE90.json');
						expect(query.sql).to.equal(
							'select "service_bulletin".* ' +
							'from "service_bulletin"' +
							' where "engine_model" = ?');
						query.response(expectedResponse);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from "service_bulletin_ata"' +
							' where "service_bulletin_ata"."sb_id" in (?, ?, ?) order by "id" asc');
						query.response(
							[
								{
									ata: '72-53-00',
									created_by: null,
									created_date: '2016-10-23T19:50:42.408Z',
									id: '2483',
									last_modified_by: null,
									last_modified_date: '2016-10-23T19:50:42.408Z',
									sb_id: '7552',
									sb_number: '72-0007',
									sb_version: '1'
								}
							]);
					}
				][step - 1]();
			});
		});
		it('Should return latest service bulletins associated with the engine model',
			(done) => {
				request(app)
					.get('/api/v1/servicebulletins?engineModel=GE90')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							const expectedResponse = require('./expected-responses/expected-SB-GE90.json');
							expect(res.body).to.eql(expectedResponse);
							done();
						}
					});
			}
		);
	});

	describe('When queried for service bulletins by id', (query, step) => {
		const expectedResponse = require('./test-inputs/expected-SB-id.json');
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin".* ' +
							'from "service_bulletin"' +
							' where "sb_id" = ?');
						query.response(expectedResponse);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from "service_bulletin_ata"' +
							' where "service_bulletin_ata"."sb_id" in (?) order by "id" asc');
						query.response(
							[
								{
									ata: '72-53-00',
									created_by: null,
									created_date: '2016-10-23T19:50:42.408Z',
									id: '2483',
									last_modified_by: null,
									last_modified_date: '2016-10-23T19:50:42.408Z',
									sb_id: '7552',
									sb_number: '72-0007',
									sb_version: '1'
								}
							]);
					}
				][step - 1]();
			});
		});
		it('Should return service bulletins associated with that id',
			(done) => {
				request(app)
					.get('/api/v1/servicebulletins/12')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							expect(res.body).to.eql(expectedResponse);
							done();
						}
					});
			}
		);
	});

	describe('When service bulletins job is triggered', (query, step) => {
		before(() => {

		});
		it('Should load service bulletins along with ATA associations and audit',
			(done) => {
				tracker.on('query', (query, step) => {
					[
						() => {
							const expectedResponse = require('./test-inputs/SB-GE90.json');
							expect(query.sql).to.equal(
								'insert into "service_bulletin" ' +
								'("active", "compliance_category", "created_by", "created_date", ' +
								'"engine_model", "last_modified_by", "last_modified_date", ' +
								'"sb_number", "sb_version", "title") ' +
								'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning "sb_id"');
							query.response(expectedResponse);
						},
						() => {
							const expectedResponse = require('./test-inputs/SB-GE90.json');
							expect(query.sql).to.equal(
								'insert into "service_bulletin" ' +
								'("active", "compliance_category", "created_by", "created_date", ' +
								'"engine_model", "last_modified_by", "last_modified_date", ' +
								'"sb_number", "sb_version", "title") ' +
								'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning "sb_id"');
							query.response(expectedResponse);
						},
						() => {
							const expectedResponse = require('./test-inputs/SB-GE90.json');
							expect(query.sql).to.equal(
								'insert into "service_bulletin" ' +
								'("active", "compliance_category", "created_by", "created_date", ' +
								'"engine_model", "last_modified_by", "last_modified_date", ' +
								'"sb_number", "sb_version", "title") ' +
								'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning "sb_id"');
							query.response(expectedResponse);
						},
						() => {
							expect(query.sql).to.equal(
								'insert into "service_bulletin_audit" ' +
								'("modified_by", "modified_date", "sb_id", "sb_number", ' +
								'"sb_version", "service_bulletin_data", "user_action") ' +
								'values (?, ?, ?, ?, ?, ?, ?) returning "id"');
							query.response([{}]);
						},
						() => {
							expect(query.sql).to.equal(
								'insert into "service_bulletin_audit" ' +
								'("modified_by", "modified_date", "sb_id", "sb_number", ' +
								'"sb_version", "service_bulletin_data", "user_action") ' +
								'values (?, ?, ?, ?, ?, ?, ?) returning "id"');
							query.response([{}]);
						},
						() => {
							// there is only one SB in the input that has ATA in description
							// so this query is executed only once
							expect(query.sql).to.equal(
								'insert into "service_bulletin_ata" ' +
								'("ata", "created_date", "last_modified_date", "sb_id", ' +
								'"sb_number", "sb_version") values ' +
								'(?, ?, ?, ?, ?, ?) returning "id"');
							query.response([{}]);
						},
						() => {
							expect(query.sql).to.equal(
								'insert into "service_bulletin_audit" ' +
								'("modified_by", "modified_date", "sb_id", "sb_number", ' +
								'"sb_version", "service_bulletin_data", "user_action") ' +
								'values (?, ?, ?, ?, ?, ?, ?) returning "id"');
							query.response([{}]);
						},
						() => {
							expect(query.sql).to.equal(
								'insert into "service_bulletin_ata_audit" ' +
								'("ata_id", "modified_by", "modified_date", ' +
								'"sb_id", "sb_number", "sb_version", ' +
								'"service_bulletin_ata_data", ' +
								'"user_action") values (?, DEFAULT, ?, ?, ?, ?, ?, ?) ' +
								'returning "id"');
							query.response({});
							done();
						},

						() => {
							// if any of the above queries did not match, it will reach
							// this block and fail the test
							done(new Error('Error executing queries'));
						}
					][step - 1]();
				});
				let reqStub = sinon.stub(req, 'get');
				reqStub.yields(null, { statusCode: 200 },
					require('./test-inputs/SB-data-service-response.json'));
				serviceBulletinManager.loadServiceBulletinByModel('GE90-115B');
			}
		);
	});

	describe('When I update service bulletins with existing ATA', (query, step) => {
		const expectedResponse = require('./expected-responses/expected-SB-update.json');
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'update "service_bulletin_ata" set "ata" = ?, "id" = ?, ' +
							'"last_modified_by" = ?, "last_modified_date" = ?, ' +
							'"level_of_disassembly" = ?, "sb_id" = ?, "sb_number" = ?, ' +
							'"sb_version" = ? where "id" = ?');
						query.response({});
					},
					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_ata_audit" ' +
							'("ata_id", "modified_by", "modified_date", "sb_id", "sb_number", ' +
							'"sb_version", "service_bulletin_ata_data", "user_action") ' +
							'values (?, ?, ?, ?, ?, ?, ?, ?) returning "id"');
						query.response({});
					},
					() => {
						expect(query.sql).to.equal(
							'update "service_bulletin" set "last_modified_by" = ?, ' +
							'"last_modified_date" = ?, "sb_id" = ?, "sb_number" = ?, ' +
							'"sb_version" = ?, "status" = ? where "sb_id" = ? and ' +
							'"sb_number" = ? and "sb_version" = ? and "sb_id" = ?');
						query.response({});
					},
					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_audit" ' +
							'("modified_by", "modified_date", "sb_id", "sb_number", ' +
							'"sb_version", "service_bulletin_data", "user_action") ' +
							'values (?, ?, ?, ?, ?, ?, ?) returning "id"');
						query.response([{}]);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin".* from "service_bulletin" where ' +
							'"service_bulletin"."sb_id" = ? and ' +
							'"service_bulletin"."sb_number" = ? ' +
							'and "service_bulletin"."sb_version" = ? limit ?');
						query.response([{
							sb_number: '72-0226',
							sb_version: '9',
							sb_id: '373',
							title: 'ENGINE - Low Pressure Turbine ' +
							'Rotor/Stator Assembly (72-56-00) - Stage 6 LPT Blade Replacement',
							description: null,
							engine_model: 'GE90-115B',
							compliance_category: '7',
							impact_category: null,
							esn_applicability: null,
							status: 'ACCEPTED',
							active: true,
							created_by: 'JOB',
							created_date: '2016-11-03T23:14:29.495Z',
							last_modified_by: 'ADMIN',
							last_modified_date: '2016-11-15T05:53:57.494Z'
						}
						]);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from "service_bulletin_ata" ' +
							'where "service_bulletin_ata"."sb_id" in (?) order by "id" asc');
						query.response([
							{
								ata: '72-56-00',
								created_by: null,
								created_date: '2016-11-03T23:14:30.563Z',
								id: '242',
								last_modified_by: 'ADMIN',
								last_modified_date: '2016-11-15T05:53:55.476Z',
								level_of_disassembly: '2',
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9'
							}
						]);
					}

				][step - 1]();
			});
		});
		it('Should update ATA details',
			(done) => {
				request(app)
					.put('/api/v1/servicebulletins/373')
					.send({
						sb_id: '373',
						sb_number: '72-0226',
						sb_version: '9',
						status: 'ACCEPTED',
						ServiceBulletinATA: [
							{
								id: '242',
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9',
								ata: '72-56-00',
								level_of_disassembly: 2
							}] })
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							expect(res.body).to.eql(expectedResponse);
							done();
						}
					});
			}
		);
	});

	describe('When I update service bulletins with new ATA', (query, step) => {
		const expectedResponse = require('./expected-responses/expected-SB-update.json');
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_ata" ' +
							'("ata", "created_by", "created_date", "last_modified_by", ' +
							'"last_modified_date", "level_of_disassembly", "sb_id", ' +
							'"sb_number", "sb_version") values (?, ?, ?, ?, ?, ?, ?, ?, ?)' +
							' returning "id"');
						query.response({});
					},
					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_ata_audit" ' +
							'("ata_id", "modified_by", "modified_date", ' +
							'"sb_id", "sb_number", "sb_version", "service_bulletin_ata_data", ' +
							'"user_action") values (DEFAULT, ?, ?, ?, ?, ?, ?, ?) returning "id"');
						query.response({});
					},
					() => {
						expect(query.sql).to.equal(
							'update "service_bulletin" set "last_modified_by" = ?, ' +
							'"last_modified_date" = ?, "sb_id" = ?, "sb_number" = ?, ' +
							'"sb_version" = ?, "status" = ? where "sb_id" = ? and ' +
							'"sb_number" = ? and "sb_version" = ? and "sb_id" = ?');
						query.response({});
					},

					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_audit" ' +
							'("modified_by", "modified_date", "sb_id", "sb_number", ' +
							'"sb_version", "service_bulletin_data", "user_action") ' +
							'values (?, ?, ?, ?, ?, ?, ?) returning "id"');
						query.response([{}]);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin".* from "service_bulletin" where ' +
							'"service_bulletin"."sb_id" = ? and ' +
							'"service_bulletin"."sb_number" = ? ' +
							'and "service_bulletin"."sb_version" = ? limit ?');
						query.response([{
							sb_number: '72-0226',
							sb_version: '9',
							sb_id: '373',
							title: 'ENGINE - Low Pressure Turbine ' +
							'Rotor/Stator Assembly (72-56-00) - Stage 6 LPT Blade Replacement',
							description: null,
							engine_model: 'GE90-115B',
							compliance_category: '7',
							impact_category: null,
							esn_applicability: null,
							status: 'ACCEPTED',
							active: true,
							created_by: 'JOB',
							created_date: '2016-11-03T23:14:29.495Z',
							last_modified_by: 'ADMIN',
							last_modified_date: '2016-11-15T05:53:57.494Z'
						}
						]);
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from "service_bulletin_ata" ' +
							'where "service_bulletin_ata"."sb_id" in (?) order by "id" asc');
						query.response([
							{
								ata: '72-56-00',
								created_by: null,
								created_date: '2016-11-03T23:14:30.563Z',
								id: '242',
								last_modified_by: 'ADMIN',
								last_modified_date: '2016-11-15T05:53:55.476Z',
								level_of_disassembly: '2',
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9'
							}
						]);
					}

				][step - 1]();
			});
		});
		it('Should insert ATA details',
			(done) => {
				request(app)
					.put('/api/v1/servicebulletins/373')
					.send({
						sb_id: '373',
						sb_number: '72-0226',
						sb_version: '9',
						status: 'ACCEPTED',
						ServiceBulletinATA: [
							{
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9',
								ata: '72-56-00',
								level_of_disassembly: 2
							}] })
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							expect(res.body).to.eql(expectedResponse);
							done();
						}
					});
			}
		);
	});

	describe('When I update service bulletins with ' +
		'different ids in the request url and request body', (query, step) => {
		it('Should throw error',
			(done) => {
				request(app)
					.put('/api/v1/servicebulletins/3')
					.send({
						sb_id: '373',
						sb_number: '72-0226',
						sb_version: '9',
						status: 'ACCEPTED',
						ServiceBulletinATA: [
							{
								id: '242',
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9',
								ata: '72-56-00',
								level_of_disassembly: 2
							}] })
					.set('Accept', 'application/json')
					.expect(400)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							expect(res.body).to.eql({
								errorMessage:
									'Service bulletin id is not present ' +
									'or does not match id in request body'
							});
							done();
						}
					});
			}
		);
	});

	describe('When I update service bulletins without ' +
		'sb_number and sb_version in request body', (query, step) => {
		it('Should return appropriate error message',
			(done) => {
				request(app)
					.put('/api/v1/servicebulletins/373')
					.send({
						sb_id: '373',
						status: 'ACCEPTED',
						ServiceBulletinATA: [
							{
								id: '242',
								sb_id: '373',
								sb_number: '72-0227',
								sb_version: '9',
								ata: '72-56-00',
								level_of_disassembly: 2
							}] })
					.set('Accept', 'application/json')
					.expect(400)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							expect(res.body).to.eql({
								errorMessage:
								'Service bulletin number and/or version is not present ' +
								'in request body'
							});
							done();
						}
					});
			}
		);
	});

	describe('When I delete service bulletins ata', (query, step) => {
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'BEGIN;');
						query.response();
					},
					() => {
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from ' +
							'"service_bulletin_ata" where "sb_id" = ? ' +
							'and "id" = ? limit ?');
						query.response(
							{
								ata: '72-53-00',
								created_by: null,
								created_date: '2016-10-23T19:50:42.408Z',
								id: '2483',
								last_modified_by: null,
								last_modified_date: '2016-10-23T19:50:42.408Z',
								sb_id: '7552',
								sb_number: '72-0007',
								sb_version: '1'
							}
						);
					},
					() => {
						expect(query.sql).to.equal(
							'insert into "service_bulletin_ata_audit" ' +
							'("ata_id", "modified_by", "modified_date", ' +
							'"sb_id", "sb_number", "sb_version", ' +
							'"service_bulletin_ata_data", "user_action") ' +
							'values (DEFAULT, DEFAULT, ?, DEFAULT, ' +
							'DEFAULT, DEFAULT, ?, ?) returning "id"');
						query.response([]);
					},
					() => {
						expect(query.sql).to.equal(
							'delete from "service_bulletin_ata" ' +
							'where "sb_id" = ? and "id" = ?');
						query.response([]);
					},
					() => {
						expect(query.sql).to.equal(
							'COMMIT;');
						query.response([]);
					}
				][step - 1]();
			});
		});
		it('Should create ata audit and delete ata',
			(done) => {
				request(app)
					.delete('/api/v1/servicebulletins/12/ata/34')
					.set('Accept', 'application/json')
					.expect(204)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							done();
						}
					});
			}
		);
	});

	describe('When queried for service bulletins ATA by esn', (query, step) => {
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						const expectedResponse = require('./test-inputs/SB-ata-GE90-100-DB.json');
						expect(query.sql).to.equal(
							'select "service_bulletin_ata".* from "service_bulletin_ata" ' +
							'inner join "service_bulletin" on ' +
							'"service_bulletin_ata"."sb_id" = "service_bulletin"."sb_id" ' +
							'and "service_bulletin"."engine_model" = \'GE90-100\'');
						query.response(expectedResponse);
					},
					() => {
						const expectedResponse2 = require('./test-inputs/SB-ata-GE90-100-DB2.json');
						expect(query.sql).to.equal(
							'select "service_bulletin".* from "service_bulletin" ' +
							'where "engine_model" = ? and "service_bulletin"."sb_id" in (?, ?, ?)');
						query.response(expectedResponse2);
					}
				][step - 1]();
			});
		});
		it('Should return latest service bulletins ATAs associated with the esn',
			(done) => {
				let reqStub = sinon.stub(req, 'post');
				reqStub.yields(null, { statusCode: 200 },
					require('./test-inputs/SB-esn-data-service-response.json'));
				request(app)
					.get('/api/v1/servicebulletins/engine/GE90-100/906252/ata')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						if (err) {
							done(err);
						} else {
							const expectedResponse = require('./expected-responses/SB-ata-GE90-100-expected.json');
							expect(res.body).to.eql(expectedResponse);
							done();
						}
					});
			}
		);
	});
});
