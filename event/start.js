'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const Authenticate = require('./authenticate')
const Student = require('../model/student')
const kvController = require('../controller/kv')
const bluebird = require('bluebird');

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
const AuthCall = new Authenticate()
var kv = new kvController()

var guestCheck = null

class StartController extends TelegramBaseController {

    start($) {
        
        var kvArr = kv.kvCollection('credentials/azure/')
        kvArr.then(function (kvObj){
            return kvArr
        })

        var accountGranted = ""
        const Stud = new Student($)

        if (guestCheck == null){
            $.runInlineMenu({
                method: 'sendMessage',
                params: ['*Hi, you\'ve started NYP\'s very own Telegram bot!*' + 
                '\n\nNot sure what my services are? Send /help', {parse_mode: 'Markdown'}],
                layout: 2,
                menu: [
                    {
                        text: 'Authenticate yourself!',
                        callback: (callbackQuery, message) => {
                            AuthCall.authenticate($)
                            accountGranted = "NYP"
                        }
                    },
                    {
                        text: 'Use as Guest',
                        callback: (callbackQuery, message) => {
                            AuthCall.grantGuest($, '999999Z')
                            accountGranted = "Guest"
                            $.sendMessage('You have successfully entered as guest.')
                        }
                    }
                ]
            })
            
            if(accountGranted = "Guest"){
                guestCheck = true
            }
            else {
                guestCheck = false
            }
        }
        else if (guestCheck == true){
            $.runInlineMenu({
                method: 'sendMessage',
                params: ['You are currently using a guest account, would you like to authenticate yourself as an NYP student?'
                , {parse_mode: 'Markdown'}],
                layout: 2,
                menu: [
                    {
                        text: 'Yes!',
                        callback: (callbackQuery, message) => {
                            AuthCall.authenticate($)
                            accountGranted = "NYP"
                        }
                    },
                    {
                        text: 'Stay as Guest',
                        callback: (callbackQuery, message) => {
                            AuthCall.grantGuest($, '999999Z')
                            accountGranted = "Guest"
                        }
                    }
                ]
            })
            
            if(accountGranted = "Guest"){
                guestCheck = true
            }
            else {
                guestCheck = false
            }
        }
        else{
            $.sendMessage('You are already authorised as an NYP student.')
        }
        
    }

    get routes() {
        return {
            'startHandler': 'start'
        }
    }
}

module.exports = StartController