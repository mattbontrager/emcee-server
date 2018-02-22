'use strict';

const request = require('superagent');

module.exports.process = function process(_qD, registry, log, cb) {
	const questionData = _qD;
	questionData.question = _qD.question.replace(/,.?emcee/i, '');
	const service = registry.get('question');

	if (!service) {
		return cb(false, 'No service available');
	}

	request.post(`http://${service.ip}:${service.port}/service`)
		.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
		.send(questionData)
		.end((err, res) => {
			if (err || res.statusCode !== 201) {
				log.error(err);
				return cb(false, 'I had a problem sharing your question with Matt. Please try again in a few minutes.');
			}

			return cb(false, 'Got it. Matt will answer your question at the end of his talk.');
		});

	/* saving this for admin-side query * /
	request.get(`http://${service.ip}:${service.port}/service/${question}`)
		.set('X-EMCEE-SERVICE-TOKEN', service.accessToken)
		.end((err, res) => {
			if (err || res.statusCode != 200 || !res.body.result) {
				log.error(err);
				return cb(false, `I had a problem finding out the time in ${question}`);
			}

			return cb(false, 'Got it. Matt will answer your question at the end of his talk.');

			// return cb(false, `In ${question}, it is now ${res.body.result}`);
		});
	/* */
};