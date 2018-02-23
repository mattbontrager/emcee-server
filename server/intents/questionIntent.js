'use strict';

const request = require('superagent');

const responses = [
	'10-4 good buddy! :cop:\r\nI\'ll be sure to pass this along to <@U8MNYF3H6>.',
	'Check roger! <@U8MNYF3H6> will answer this during the Q&A session coming up.',
	':clown_face: pssh. and they said there were *"no stupid questions"*? Maybe, <@U8MNYF3H6> will answer your question... if you\'re lucky.',
	':stuck_out_tongue_winking_eye: How do you like me now? <@U8MNYF3H6> will answer Q&A.',
	':middle_finger: **ANSWER THIS**! <@U8MNYF3H6> says, "Hey now that\'s not necessary!'
];

const chooseAnAnswer = () => {
	const min = 1;
	const max = responses.length;
	const rando = Math.floor(Math.random() * (max - min + 1)) + min;
	const therandom = rando - 1;
	return responses[therandom];
};

module.exports.process = function process(qD, registry, log, cb) {
	const asker_id = qD.asker_id;
	const question_channel = qD.question_channel;
	const question = qD.question;
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
				return cb(false, ':hear_no_evil: I had a problem sharing your question with Matt. Please try again in a few minutes.');
			}
			const answer = chooseAnAnswer();

			return cb(false, `${answer}`);
		});

	/* saving this for admin-side query */
	request.get(`http://${service.ip}:${service.port}/service/`)
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