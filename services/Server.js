'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const pino = require('pino')();

/**
 * Server
 * @class
 *
 * @property _url URL of server
 * @property _port Port of server
 * @property _token Telegram Token of Bot
 * @property _reddit Reddit Service Class
 * @property _bot Bot Service Class
 * @property _app Express instance
 */

class Server {
  constructor(config, tools) {
    this._url = config.url;
    this._port = config.port;
    this._token = config.token;
    this._reddit = tools.reddit;
    this._bot = tools.bot;
    this._app = express();
  }

  /**
   * Initializies server
   * @returns {undefined}
   */
  init() {
    pino.info('[Server] Initializing server...');

    this._app.use(bodyparser.urlencoded({ extended: false }));
    this._app.use(bodyparser.json());

    this._app.get('/api/recipe', async (req, res) => {
      try {
        const { search } = req.query;

        if (!search || search === '') {
          throw new Error('Invalid parameters');
        }

        const data = await this._reddit.getRecipes(search);
        pino.info(data, '[Server] Recipe Search Responded');

        return res.status(200).json({
          search,
          result: data,
        });
      } catch (e) {
        pino.error(e, '[Server] Encountered error');

        return res.status(400).json({ error: e.message });
      }
    });

    this._app.post(`/webhook/${this._token}`, async (req, res) => {
      this._bot.processUpdate(req.body);

      return res.sendStatus(200);
    });
  }

  /**
   * Starts server
   * @returns {undefined}
   */
  async start() {
    this._app.listen(this._port, '0.0.0.0', () => {
      pino.info(`[Server] Server is running on ${this._url}`);
    });
  }
}

module.exports = Server;
