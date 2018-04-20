'use strict';

const request = require('superagent');
const config = require('../../config');
const log = config.log();

module.exports.process = function process(_commandData, registry, cb) {
	log.info('in commandIntent.process');
	var type = _commandData.type,
		service = registry.get('commands'),
		serviceURI = `http://${service.ip}:${service.port}/service`,
		commandData = {command: _commandData.command},
		command = _commandData.command;

	if (!service) {
		log.error('no service!');
		return cb(false, 'No service available');
	}

	if (type === 'get') {
		request.get(`http://${service.ip}:${service.port}/service/${command}`)
			.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
			.end((err, res) => {
				if (err || res.statusCode !== 200 || !res.body.result) {
					log.error(err);
					return cb(`I had a problem delegating that command: ${command}`, null);
				} else if (res.body.warning) {
					return cb(false, `:hear_no_evil: There may have been a problem with your command: ${command}`);
				} else {
					log.info('successful GET call to the command microservice');
					return cb(false, `${res.body.result}`);
				}
			});
	} else {
		request.post(serviceURI)
			.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
			.send(commandData)
			.end((err, res) => {
				if (err || res.statusCode !== 201) {
					log.error(err);
					return cb(false, `:hankey: you sent a command I didn't recognize: ${command}.`);
				} else if (res.body.warning) {
					return cb(false, `:hear_no_evil: There may have been a problem with your command: ${command}`);
				} else {
					log.info('successfully posted command to the command microservice');
					return cb(false, `${command} was successfully executed.`);
				}
			});
	}
};