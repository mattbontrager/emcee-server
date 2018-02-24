'use strict';

require('dotenv').config();
const bunyan = require('bunyan');

const log = {
	development: () => {
		return bunyan.createLogger({name: 'EMCEE-development', level: 'debug'});
	},
	production: () => {
		return bunyan.createLogger({name: 'EMCEE-production', level: 'info'});
	},
	test: () => {
		return bunyan.createLogger({name: 'EMCEE-test', level: 'fatal'});
	}
};

module.exports = {
	slackToken: process.env.SLACK_TOKEN,
	slackLogLevel: 'verbose',
	serviceTimeout: 30,
	emceeApiToken: process.env.EMCEE_API_TOKEN,
	speakerId: process.env.SPEAKER_ID,
	log: (env) => {
		if (env) {
			return log[env]();
		}
		return log[process.env.NODE_ENV || 'development']();
	}
};