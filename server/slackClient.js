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

		const trimmed = message.text.replace(/\s?<@U9CKZNLTW>\s?/g, '');
		this._log.info(`trimmed: ${trimmed}`);

		const words = trimmed.split(' ');
		this._log.info(`number of words: ${words.length}`);

		const isLongEnough = words.length > 2;
		this._log.info(`question is long enough? ${isLongEnough}`);

		const isRightChannel = message.channel === 'D9DG5SHV4';
		this._log.info(`isRightChannel? ${isRightChannel}`);

		const isAddressedToEmcee = message.text.includes('<@U9CKZNLTW>');
		this._log.info(`isAddressedToEmcee? ${isAddressedToEmcee}`);

		const intent = require('./intents/questionIntent');

		const questionData = {
			question: trimmed,
			asker_id: message.user,
			question_channel: message.channel
		};

		if (!isRightChannel) {
			if (!isAddressedToEmcee) {
				return;
			}
		}

		if (!isLongEnough) {
			return;
		}

		// if (message.channel !== 'D9DG5SHV4' || !message.text.includes('<@U9CKZNLTW>') || isTooShort) {
		// 	return;
		// }

		/**
		 * TODO: add this filtering logic
		 **/
		//  || message.channel !== "D9DG5SHV4" || !lcQuestion.includes('<@U9CKZNLTW>')) {
		// 	return;
		// }

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