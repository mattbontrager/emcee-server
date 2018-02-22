'use strict';

const config = require('../config');
const log = config.log();

const SlackClient = require('../server/slackClient');
const service = require('../server/service')(config);
const http = require('http');
const server = http.createServer(service);


const serviceRegistry = service.get('serviceRegistry');
const slackClient = new SlackClient(config.slackToken, config.slackLogLevel, serviceRegistry, log);


slackClient.start(() => {
	server.listen(4001);
});

server.on('listening', function() {
	log.info(`Emcee is listening on ${server.address().port} in ${service.get('env')} mode.`);
});