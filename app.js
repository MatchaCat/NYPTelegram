'use strict'
//requirements
require('dotenv').config()
const Telegram = require('telegram-node-bot')
const StartController = require('./event/start'),
    HelpController = require('./event/help'),
    OtherwiseController = require('./event/otherwise')

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
const tg = new Telegram.Telegram(process.env.TELEGRAM_BOT_KEY, {workers: 1})

//api controllers
const TextCommand = Telegram.TextCommand

tg.router
    //general services
    .when(new TextCommand('/start', 'startHandler'), new StartController())
    .when(new TextCommand('/help', 'helpHandler'), new HelpController())
    .callbackQuery(new HelpController())
    
    //NYP services
    //default error handling services
    .otherwise(new OtherwiseController())

//tg.addScopeExtension()