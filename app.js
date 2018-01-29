'use strict'
//requirements
require('dotenv').config()
const Telegram = require('telegram-node-bot')

//EUGENE'S CONTROLLERS ----------------------------------------
const StartController = require('./event/start'),
    HelpController = require('./event/help'),
    OtherwiseController = require('./event/otherwise')
//-------------------------------------------------------------

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
const tg = new Telegram.Telegram(process.env.TELEGRAM_BOT_KEY, {workers: 1})

//api controllers
const TextCommand = Telegram.TextCommand

//JIA CHENG'S CONTROLLERS ------------------------------------
const ResultController = require('./event/Result')
    ,CCAController = require('./event/CCA')
    ,FeedbackController = require('./event/Feedback')
    ,MediaController = require('./event/Media.js')
    ,HelpDeskController = require('./event/HelpDesk.js')

const resultCtrl = new ResultController();
const ccaCtrl = new CCAController();
const feedbackCtrl = new FeedbackController();
const mediaCtrl = new MediaController();
const helpdeskCtrl = new HelpDeskController();
//-------------------------------------------------------------

tg.router
    //general services
    .when(new TextCommand('/start', 'startHandler'), new StartController())
    .when(new TextCommand('/help', 'helpHandler'), new HelpController())
    .callbackQuery(new HelpController())

    //NYP services
    .when(new Telegram.TextCommand('/viewsemresult', 'viewAllSemResultCommand'), resultCtrl)
    .when(new Telegram.TextCommand('/ccarecords', 'viewCCARecordsCommand'), ccaCtrl)
    .when(new Telegram.TextCommand('/feedback', 'submitFeedbackCommand'), feedbackCtrl)
    .when(new Telegram.TextCommand('/instagrampost', 'viewLatestInstagramPostCommand'), mediaCtrl)
    .when(new Telegram.TextCommand('/helpdesk', 'helpDeskCommand'), helpdeskCtrl)
    //default error handling services
    .otherwise(new OtherwiseController())

//tg.addScopeExtension()