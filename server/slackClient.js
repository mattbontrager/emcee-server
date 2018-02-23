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

		if (!message.text) {
			return;
		}

		/**
		 * TODO: move this out to emcee-questions microservice
		 */

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

		const isMatt = message.user === 'U8MNYF3H6';

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

		if (!isLongEnough && !isMatt) {
			return;
		}

		if (isMatt) {
			const triggerSessionBeginActions = () => {
				// timestamp begin talk time in db
			};

			const triggerSessionEndActions = () => {
				// timestamp end talk time in db
			};

			const triggerTalkStartActions = () => {
				// whatever these need to be
			};

			const triggerTalkDoneActions = () => {
				// timestamp in db
				// serve up any questions that may have been asked during the talk
			};

			const command = trimmed;
			const aboutMeLink = '[Matt Bontrager\'s Bio](https://about.me/mattbontrager "Matt Bontrager: About Me")';

			let response;
			let channel;

			switch(command) {
			case 'send about me':
				response = aboutMeLink;
				channel = 'C9C4Q60UR';
				break;
			case 'begin session':
				triggerSessionBeginActions();
				response = 'whatever it needs to be';
				channel = message.channel;
				break;
			case 'end session':
				triggerSessionEndActions();
				response = 'whatever it needs to be';
				channel = message.channel;
				break;
			case 'starting talk':
				triggerTalkStartActions();
				response = 'whatever it needs to be';
				channel = message.channel;
				break;
			case 'done talking':
				triggerTalkDoneActions();
				response = 'whatever it needs to be';
				channel = message.channel;
				break;
			}

			return this._rtm.sendMessage(response, channel);
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