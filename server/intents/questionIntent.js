'use strict';

const request = require('superagent');

module.exports.process = function process(qD, registry, log, cb) {
	const asker_id = qD.asker_id;
	const question_channel = qD.question_channel;
	const question = qD.question.replace(/emcee/i, '');
	const questionData = {
		asker_id: asker_id,
		question_channel: question_channel,
		question: question
	};
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

			return cb(false, 'Got it. <@U8MNYF3H6> will answer your question at the end of his talk.');
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