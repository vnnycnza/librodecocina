'use strict';

const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino')();

/**
 * Bot
 * @class
 *
 * @property _env environment where app is running
 * @property _url URL of server
 * @property _token Telegram Token of Bot
 * @property _source Reddit Service Class
 * @property _bot Bot Instance
 */

class Bot {
  constructor(config, tools) {
    this._env = config.env;
    this._token = config.token;
    this._url = config.url;
    this._source = tools.reddit;
    this._bot = null;
  }

  /**
   * Initializies telegram bot service
   * @returns {Promise}
   */
  async init() {
    pino.info('[Bot] Initializing bot...');

    if (this._env === 'production') {
      this._bot = new TelegramBot(this._token);
      this._bot.setWebHook(`${this._url}/webhook/${this._token}`);
    } else {
      this._bot = new TelegramBot(this._token, { polling: true });
    }

    this._bot.onText(/\/(help|start)/, async m => this._processHelpMessage(m));
    this._bot.onText(/^(?!\/(help|start)).*$/, async m =>
      this._processAnyMessage(m),
    );
  }

  /**
   * Function to call for webhook
   * starts with anything except "/help" or "/start"
   *
   * @param {Object} request
   * @returns {Promise}
   */
  async processUpdate(request) {
    this._bot.processUpdate(request);
  }

  /**
   * Callback function for bot.onText when keyword
   * starts with "/help" or "/start"
   *
   * @param {Object} msg
   * @returns {Promise}
   */
  async _processHelpMessage(msg) {
    const reply = Bot._getHelpMessage();
    this._bot.sendMessage(msg.chat.id, reply, {
      parse_mode: 'Markdown',
    });
  }

  /**
   * Callback function for bot.onText when keyword
   * starts with anything except "/help" or "/start"
   *
   * Triggers call to `sendChatAction` which shows "Sending Photo..."
   * Then calls Reddit Service (`this._source`) for results
   * Queries for max of 5 recipes so that we have spare results
   * to send in case `bot.sendVideo` throws an error
   * When no results are returned or all calls to sendDocument fails,
   * it calls send default no results found msg
   *
   * @param {Object} msg
   * @returns {Promise}
   */
  async _processAnyMessage(msg) {
    const recipient = msg.chat.id;
    await this._bot.sendChatAction(recipient, 'upload_photo');
    const query = msg.text.toLowerCase().trim();

    const recipes = await this._source.getRecipes(query, 5);

    if (recipes.length === 0) {
      await this._sendNoResultsFound(recipient);
    } else {
      let success = false;
      for (const r of recipes) {
        let error = false;

        try {
          await this._bot.sendVideo(recipient, r.gif, {
            caption: Bot._getCaption(r.title, r.url),
            parse_mode: 'Markdown',
          });
        } catch (e) {
          error = true;
          pino.error(e, '[Bot] Error in sending gif');
        }

        if (!error) {
          pino.info('[Bot] Successfully sent message');
          success = true;
          break;
        }
      }

      if (!success) {
        await this._sendNoResultsFound(recipient);
      }
    }
  }

  /**
   * Sends default no results found msg to user
   * Calls `bot.sendMessage`
   *
   * @param {Integer} recipient
   * @returns {Promise}
   */
  async _sendNoResultsFound(recipient) {
    pino.info('[Bot] No results found. Successfully sent message.');
    const message =
      '🍔🍽🍕\n*LookForRecipes*\n\n' +
      '😔 Sorry! Cant seem to find a match, please try to search for a different keyword';

    this._bot.sendMessage(recipient, message, {
      parse_mode: 'Markdown',
    });
  }

  /**
   * Returns help message
   * @returns {String}
   */
  static _getHelpMessage() {
    return (
      '🍔🍽🍕\n*LookForRecipes*\n\n' +
      'Type for any keyword you want to get recipe for\n' +
      'All results from [r/GifRecipes](https://www.reddit.com/r/GifRecipes/) 🙌'
    );
  }

  /**
   * Returns caption for gif
   * @param {String} title
   * @param {String} url
   * @returns {String}
   */
  static _getCaption(title, url) {
    return `😋 [${title}](${url})`;
  }
}

module.exports = Bot;
