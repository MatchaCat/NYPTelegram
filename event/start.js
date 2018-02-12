'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const Authenticate = require('./authenticate')
const Student = require('../model/student')
const Database = require('../controller/db')
const bluebird = require('bluebird')

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
const AuthCall = new Authenticate()
var dbCall = bluebird.promisifyAll(new Database())
var student = bluebird.promisifyAll(new Student())

class StartController extends TelegramBaseController {

    start($){
        student.retrieve($, function(dollarres){
            if (dollarres[1] !== undefined && dollarres[1].id == null && dollarres[1].acct_type == null){
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
                            }
                        },
                        {
                            text: 'Use as Guest',
                            callback: (callbackQuery, message) => {
                                var counter = AuthCall.grantGuest($)
                                if(counter == true){
                                    $.sendMessage('You have successfully entered as guest.')
                                }
                                else{
                                    $.sendMessage('Oh no. Something went wrong.')
                                    $.sendSticker('CAADBAADwhEAAvEGNAYxwEXtir6DLgI')
                                }
                                
                            }
                        }
                    ]
                })
            }
            else if (dollarres[1] !== undefined && dollarres[1].id !== null && dollarres[1].acct_type == "GUEST"){
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
                            }
                        },
                        {
                            text: 'Stay as Guest',
                            callback: (callbackQuery, message) => {
                                $.sendMessage('You may continue to enjoy your guest privilege.')
                            }
                        }
                    ]
                })
            }
            else if (typeof dollarres[1] !== 'undefined' && dollarres[1].id !== null && dollarres[1].acct_type == "NYP"){
                $.sendMessage('You are already authorised as an NYP student.')
            }
            else{
                console.log("ELSE ERROR ON USER: --> " + dollarres[1])
                $.sendMessage('*Oh no, something went wrong.* \n\nPlease kill the bot by pressing "Delete conversation" in the drop-down menu on the right side of the chat header.\n\nWe are very sorry. :(', {parse_mode: 'Markdown'})
            }
        })
    }

    

    get routes() {
        return {
            'startHandler': 'start'
        }
    }
}

module.exports = StartController