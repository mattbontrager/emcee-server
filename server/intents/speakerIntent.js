'use strict';

const request = require('superagent');
const config = require('../../config');
const log = config.log();

module.exports.process = function process(commandData, registry, cb) {
	log.info(`in speakerIntent.process with this command data: ${JSON.stringify(commandData.command)}`);
	const service = registry.get('question');
	const serviceURI = `http://${service.ip}:${service.port}/service/command`;
	log.info(`serviceURI: ${serviceURI}`);

	if (!service) {
		log.error('no service!');
		return cb(false, 'No service available');
	}

	try {
		return request.get(serviceURI)
			.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
			.query({command: commandData.command})
			.then(res => {
				log.info('successfully "GET"\'d your command to the question microservice');
				return cb(false, `${res.answer}`);
			})
			.catch(err => {
				log.error(`error inside the request call catch: ${JSON.stringify(err)}`);
				return cb(`:hear_no_evil: I had a problem sharing your command with ${config.speakerId}. Please try again in a few minutes.`, null);
			});
	} catch (error) {
		log.error(`try catch error: ${JSON.stringify(error)}`);
		return Promise.reject(`try catch error: ${JSON.stringify(error)}`);
	}
};