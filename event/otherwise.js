'use strict';

const Telegram = require('telegram-node-bot');

class OtherwiseController extends Telegram.TelegramBaseController{
  handle($){
    $.sendMessage('Sorry, I don\'t understand. Perhaps You can use the command /help to show you the way');
  }
}

module.exports = OtherwiseController;
