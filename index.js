/**
 * Entrypoint
 * @module index.js
 */

'use strict';

const Bot = require('./services/Bot');
const Reddit = require('./services/Reddit');
const Server = require('./services/Server');
const pino = require('pino')();

/**
 * Main Function
 * @returns {undefined}
 */
async function main() {
  const config = {
    app: {
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      url: process.env.URL || 'http://localhost:3001',
    },
    bot: {
      token: process.env.TELEGRAM_TOKEN,
    },
    reddit: {
      ua: process.env.REDDIT_USER_AGENT,
      client: process.env.REDDIT_CLIENT_ID,
      secret: process.env.REDDIT_CLIENT_SECRET,
      uname: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    },
  };

  try {
    validateConfig(config);

    const reddit = new Reddit(config.reddit);
    await reddit.init();

    const bot = new Bot({ ...config.app, ...config.bot }, { reddit });
    await bot.init();

    const server = new Server(
      { ...config.app, ...config.bot },
      { reddit, bot },
    );

    await server.init();
    await server.start();
  } catch (e) {
    pino.error(e, '[App] An error occured');
  }
}

/**
 * Validates if the config from env variables are complete
 * @param {Object} config
 * @throws {Error}
 * @returns {undefined}
 */
function validateConfig(config) {
  const isIncomplete = obj => Object.values(obj).some(item => !item);

  if (isIncomplete(config.app)) {
    throw new Error('InvalidAppConfiguration');
  }

  if (isIncomplete(config.bot)) {
    throw new Error('InvalidBotConfiguration');
  }

  if (isIncomplete(config.reddit)) {
    throw new Error('InvalidRedditConfiguration');
  }
}

// This module can be run directly from the command line as in `node app.js`
// https://nodejs.org/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  main();
} else {
  // Useful for testing.
  module.exports = main;
}
