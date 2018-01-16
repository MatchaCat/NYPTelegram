'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController

class OtherwiseController extends TelegramBaseController {

    handle($) {
        console.log('Otherwise prompted.')
    }
}

module.exports = OtherwiseController