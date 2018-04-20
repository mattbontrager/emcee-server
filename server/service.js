'use strict';

const express = require('express');
const service = express();
const ServiceRegistry = require('./serviceRegistry');

module.exports = (config) => {
	// const log = config.log();
	const serviceRegistry = new ServiceRegistry(config.serviceTimeout, config.log());

	service.set('serviceRegistry', serviceRegistry);
	service.put('/service/:intent/:port', (req, res) => {
		if (req.get('X-EMCEE-API-TOKEN') !== config.emceeApiToken) {
			return res.sendStatus(403);
		}

		if (!req.get('X-EMCEE-SERVICE-TOKEN')) {
			return res.sendStatus(400);
		}

		const serviceIntent = req.params.intent;
		const servicePort = req.params.port;
		const serviceIp = '127.0.0.1';

		serviceRegistry.add(serviceIntent, serviceIp, servicePort, req.get('X-EMCEE-SERVICE-TOKEN'));
		res.json({result: `${serviceIntent} at ${serviceIp}:${servicePort}`});
	});

	return service;
};