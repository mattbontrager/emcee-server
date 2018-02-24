'use strict';

const request = require('superagent');
// const config = require('../../config');
// const log = config.log();

module.exports.process = function process(ci, registry, cb) {
	const service = registry.get('question');
	const serviceURI = `http://${service.ip}:${service.port}/service/`;

	if (!service) {
		return cb(false, 'No service available');
	}

	request.get(serviceURI)
		.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
		.query({
			command: ci.command,
			channel: ci.response_channel
		})
		.then((res) => {
			return cb(false, `${res.answer}`);
		});
};