'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

class SlackClient {
	constructor(token, logLevel, registry, log) {
		this._rtm = new RtmClient(token, {
			logLevel: logLevel,
			useRtmConnect: true,
			dataStore: false
		});
		// this._rtm = new RtmClient(token, {logLevel: logLevel});
		this._registry = registry;
		this._log = log;

		this._addAuthenticatedHandler(this._handleOnAuthenticated);
		this._rtm.on(RTM_EVENTS.MESSAGE, this._handleOnMessage.bind(this));
	}

	_handleOnAuthenticated(rtmStartData) {
		this._log.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
	}

	_addAuthenticatedHandler(handler) {
		this._rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler.bind(this));
	}

	_handleOnMessage(message) {
		this._log.info(`in _handleOnMessage for emcee: ${JSON.stringify(message)}`);
		const questionData = {
			question: message.text,
			asker_id: message.user,
			question_channel: message.channel
		};
		const lcQuestion = message.text.toLowerCase();
		const intent = require('./intents/questionIntent');

		if (!lcQuestion.includes('emcee')) {
			return;
		}

		try {
			intent.process(questionData, this._registry, this._log, (error, response) => {
				if (error) {
					this._log.error(error.message);
					return;
				}

				return this._rtm.sendMessage(response, message.channel);
			});
		} catch(err) {
			this._log.error(err);
			this._log.error(questionData.question);
			this._rtm.sendMessage('I\'m so sorry! But, I didn\'t catch that question. Please ask again.', message.channel);
		}
	}

	start(handler) {
		this._addAuthenticatedHandler(handler);
		this._rtm.start();
	}
}

module.exports = SlackClient;