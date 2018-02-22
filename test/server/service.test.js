'use strict';

require('should');

const request = require('supertest');
const config = require('../../config');
const service = require('../../server/service')(config);

describe('The Express service', () => {
	describe('PUT /foo', () => {
		it('should return HTTP 404', (done) => {
			request(service)
				.put('/foo')
				.expect(404, done);
		});
	});
});