'use strict';

const request = require('superagent');
const config = require('../../config');
const log = config.log();

module.exports.process = function process(_questionData, registry, cb) {
	log.info('in questionIntent.process');
	var service = registry.get('questions'),
		serviceURI = `http://${service.ip}:${service.port}/service`;

	if (!service) {
		log.error('no service!');
		return cb(false, 'No service available');
	}


	request.post(serviceURI)
		.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
		.send(_questionData)
		.end((err, res) => {
			if (err || res.statusCode !== 201) {
				log.error(err);
				return cb(`:hear_no_evil: I had a problem sharing your question with ${config.speakerId}. Please try again in a few minutes.`, null);
			}

			log.info('successfully posted question to the question microservice');
			return cb(false, res.body.result);
		});
};