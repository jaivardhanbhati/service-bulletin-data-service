'use strict';

const request = require('supertest');
const chai = require('chai');
const app = require('./mocked-app');
const expect = chai.expect;
var tracker = require('mock-knex').getTracker();

describe('Engine Modules data manager', () => {
	beforeEach(() => {
		tracker.install();
	});

	afterEach(() => {
		tracker.uninstall();
	});

	describe('When no module data exists for the given model', (query, step) => {
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'select "engine_module_hierarchy".* ' +
							'from "engine_module_hierarchy"' +
							' where "engine_family" = ?');
						query.response(null);
					}
				][step - 1]();
			});
		});
		it('Should return NO DATA status code.',
			(done) => {
				request(app)
					.get('/api/v1/modules/engines/family/GE90')
					.set('Accept', 'application/json')
					.end((err, res) => {
						expect(err).to.be.null;
						expect(res.status).to.eql(204);
						done();
					});
			}
		);
	});

	describe('When queried with no model id as path param', (query, step) => {
		it('Should return resource not found(404) error code.',
			(done) => {
				request(app)
					.get('/api/v1/modules/engines/family/')
					.set('Accept', 'application/json')
					.end((err, res) => {
						expect(err).to.be.null;
						expect(res.status).to.eql(404);
						done();
					});
			}
		);
	});

	describe('When queried for engine modules by engine model GE90', (query, step) => {
		before(() => {
			tracker.on('query', (query, step) => {
				[
					() => {
						expect(query.sql).to.equal(
							'select "engine_module_hierarchy".* ' +
							'from "engine_module_hierarchy"' +
							' where "engine_family" = ?');
						query.response(require('./test-inputs/Modules-GE90.json'));
					}
				][step - 1]();
			});
		});
		it('Should return GE90 modules in the expected hierarchy',
			(done) => {
				request(app)
					.get('/api/v1/modules/engines/family/GE90')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						expect(err).to.be.null;
						expect(res.body).to.eql(require('./expected-responses/expected-Modules-GE90.json'));
						done();
					});
			}
		);
	});
});
