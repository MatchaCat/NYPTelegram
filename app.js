'use strict'
//requirements
require('dotenv').config()
const Telegram = require('telegram-node-bot')
const kvController = require('./controller/kv')
const bluebird = require('bluebird')
const authController = require('./event/authenticate')

//EUGENE'S CONTROLLERS ----------------------------------------
const StartController = require('./event/start'),
    HelpController = require('./event/help'),
    OtherwiseController = require('./event/otherwise')
//-------------------------------------------------------------

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
var kv = bluebird.promisifyAll(new kvController())

var tgKey = kv.kvRetrieve(process.env.TELEGRAM_BOT_KEY)
var tg = tgKey.then((tgKey) => {
    return new Telegram.Telegram(tgKey.Value, {
        workers: 1
        // webhook: {
        //     url: process.env.WEBHOOK_URL + "/" + tgKey.Value,
        //     port: 8443,
        //     host: 'localhost'
        // }
    })
})

//api controllers
const TextCommand = Telegram.TextCommand

//JIA CHENG'S CONTROLLERS ------------------------------------
const ResultController = require('./event/Result')
    ,CCAController = require('./event/CCA')
    ,FeedbackController = require('./event/Feedback')
    ,MediaController = require('./event/Media.js')
    ,FAQController = require('./event/FAQ.js')

const resultCtrl = new ResultController();
const ccaCtrl = new CCAController();
const feedbackCtrl = new FeedbackController();
const mediaCtrl = new MediaController();
const FAQCtrl = new FAQController();
//-------------------------------------------------------------

tg.then(function(tg){
    tg.router
    //general services
    .when(new TextCommand('/start', 'startHandler'), new StartController())
    .when(new TextCommand('/help', 'helpHandler'), new HelpController())
    .callbackQuery(new HelpController())

    //NYP services
    .when(new Telegram.TextCommand('/viewsemresult', 'viewAllSemResultCommand'), resultCtrl)
    .when(new Telegram.TextCommand('/cca', 'viewCCACommand'), ccaCtrl)
    .when(new Telegram.TextCommand('/feedback', 'submitFeedbackCommand'), feedbackCtrl)
    .when(new Telegram.TextCommand('/socialmedia', 'viewLatestInstagramPostCommand'), mediaCtrl)
    .when(new Telegram.TextCommand('/faq', 'FAQCommand'), FAQCtrl)
    //default error handling services
    .otherwise(new OtherwiseController())
})

//tg.addScopeExtension()