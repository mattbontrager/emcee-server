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
	// witToken: process.env.WIT_TOKEN,
	slackToken: process.env.SLACK_TOKEN,
	slackLogLevel: 'verbose',
	serviceTimeout: 30,
	emceeApiToken: process.env.EMCEE_API_TOKEN,
	log: (env) => {
		if (env) {
			return log[env]();
		}
		return log[process.env.NODE_ENV || 'development']();
	}
};



// slack client id: 295300613286.319294540727
// slack client secret: e7b9c1a626a9379c8abc9b228265f719
// slack verification token: 43tWPafuUft0kr0W5J7Y6JSvs