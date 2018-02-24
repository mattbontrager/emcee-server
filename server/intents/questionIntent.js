'use strict';

const request = require('superagent');
const config = require('../../config');
const log = config.log();

module.exports.process = function process(qD, registry, cb) {
	const service = registry.get('question');
	const serviceURI = `http://${service.ip}:${service.port}/service/`;

	if (!service) {
		return cb(false, 'No service available');
	}

	const asker_id = qD.asker_id;
	const question_channel = qD.question_channel;
	const question = qD.question;

	const questionData = {
		asker_id: asker_id,
		question_channel: question_channel,
		question: question
	};

	request.post(serviceURI)
		.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
		.send(questionData)
		.end((err, res) => {
			if (err || res.statusCode !== 201) {
				log.error(err);
				return cb(false, ':hear_no_evil: I had a problem sharing your question with Matt. Please try again in a few minutes.');
			}

			return cb(false, `${res.answer}`);
		});
};