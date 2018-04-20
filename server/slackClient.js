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
		this._registry = registry;
		this._log = log;

		this._addAuthenticatedHandler(this._handleOnAuthenticated);
		this._rtm.on(RTM_EVENTS.MESSAGE, this._handleOnMessage.bind(this));
	}

	_handleOnAuthenticated(rtmStartData) {
		this._log.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
	}

	_addAuthenticatedHandler(handler) {
		this._log.info('in _addAuthenticatedHandler');
		this._rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler.bind(this));
	}

	_handleOnMessage(message) {
		this._log.info(`in _handleOnMessage for emcee: ${JSON.stringify(message)}`);

		if (!message || !message.text || !message.text.length) {
			return;
		}

		var isNotSpeaker = message.user !== process.env.SPEAKER_ID,
			// eslint-disable-next-line
			trimmed = message.text.replace(/\s?<@U9CKZNLTW>\s?/g, ''),
			words = trimmed.split(' '),
			isLongEnough = words.length > 2,
			isWrongChannel = (message.channel !== 'D9DG5SHV4' || message.channel !== 'C9C4Q60UR') ? true: false,
			isNotAddressedToEmcee = !message.text.includes('<@U9CKZNLTW>');

		if (isNotAddressedToEmcee) {
			this._log.warn('not addressed to Emcee so he shouldnt care about it.');
			return;
		}

		/** don't process the message if it is too short */
		if (!message.text) {
			this._log.warn('no message text passed to _handleOnMessage');
			return;
		}
		/** kill it if the message is in the wrong channel AND is not addressed to the emcee bot */
		if (isWrongChannel && isNotAddressedToEmcee && isNotSpeaker) {
			this._log.warn('is in wrong channel and is not addressed to emcee');
			return;
		}
		/** kill it if the message is too short AND did not come from the speaker */
		if (!isLongEnough && isNotSpeaker) {
			this._log.warn('question is not long enough and didnot come from the speaker');
			return;
		}

		if (isNotSpeaker && isLongEnough) {
			this._log.info('is from audience and is long enough');
			const _qd = {
				question: trimmed,
				asker_id: message.user,
				question_channel: message.channel
			};
			this._handleAudienceQuestion(_qd, message.channel);
		} else {
			this._log.info('is from the speaker. going to commands');
			const _cd = {
				command: trimmed
			};
			if (trimmed === 'aboutme') {
				_cd.type = 'get';
				this._handleSpeakerCommand(_cd, 'C9C4Q60UR');
			} else {
				_cd.type = 'post';
				this._handleSpeakerCommand(_cd, message.channel);
			}
		}
	}

	_handleAudienceQuestion(slackMessage, channel) {
		this._log.info('in _handleAudienceQuestion');
		var intent = require('./intents/questionIntent');
		try {
			this._log.info('trying the questionIntent.process now');
			intent.process(slackMessage, this._registry, (error, response) => {
				if (error) {
					this._log.error(error.message);
					return;
				}

				return this._rtm.sendMessage(response, channel);
			});
		} catch (err) {
			this._log.error(err);
			this._log.error(slackMessage[Object.keys(slackMessage)[0]]);
			return this._rtm.sendMessage('I\'m so sorry! But, I didn\'t catch that question. Please ask again.', channel);
		}
	}

	_handleSpeakerCommand(slackMessage, channel) {
		this._log.info('in _handleSpeakerCommand');
		var intent = require('./intents/commandIntent');

		try {
			this._log.info('trying the commandIntent.process now');
			intent.process(slackMessage, this._registry, (error, response) => {
				if (error) {
					this._log.error(error.message);
					return;
				}

				return this._rtm.sendMessage(response, channel);
			});
		} catch (err) {
			this._log.error(err);
			this._log.error(slackMessage[Object.keys(slackMessage)[0]]);
			return this._rtm.sendMessage('I\'m so sorry! But, I dropped that command somewhere. Please try again.', channel);
		}
	}

	start(handler) {
		this._addAuthenticatedHandler(handler);
		this._rtm.start();
	}
}

module.exports = SlackClient;