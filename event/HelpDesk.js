'use strict';

const Telegram = require('telegram-node-bot');


// const azureSearch = require('./azureSearchApiClient');

// const azureSearchQuery = azureSearch({
//     searchName = "help-desk-telegram-bot-search",
//     indexName="knowledge-base-index",
//     searchKey="F079A68FC333444E7ADBB2A8274881B4"
// });
// require('dotenv').config();
// const restify = require('restify');
// const builder = require('botbuilder');

// // Setup Restify Server
// var server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 8080, () => {
//     console.log('%s listening to %s', server.name, server.url);
// });

// // Create chat connector for communicating with the Bot Framework Service
// var connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });

// // Listen for messages from users
// server.post('/api/messages', connector.listen());



class HelpDeskController extends Telegram.TelegramBaseController {
    helpdeskCommandHandler($) {
        $.runInlineMenu({
            layout: 2, //some layouting here
            method: 'sendMessage', //here you must pass the method name
            params: ['First, please tell me which would you like to do :)'], //here you must pass the parameters for that method
            menu: [
                {
                    text: 'Talk to human agent', //text of the button
                    callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        // console.log("human")
                        // // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
                        // bot.send(new builder.Message()
                        // .text('This channel does not support this operation: '));
                    }
                },
                {
                    text: 'Explore Self-help instructions',
                    message: 'Which category is your question about?',
                    layout: 1,
                    menu: [ //Sub menu (current message will be edited)
                        {
                            text: 'Wireless@NYP',
                            message: 'Which category is your question about?',
                            layout: 2,
                            menu:[
                                {
                                    text: 'Microsoft Windows 10 ',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win10_20170323.pdf', filename: 'win10.pdf'}));
                                     }
                                },
                                {
                                    text: 'Microsoft Windows 8 ',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win8_20170323.pdf', filename: 'win8.pdf'}));
                
                                    }
                                },
                                {
                                    text: 'Microsoft Windows 7',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win7_20170323.pdf', filename: 'win7.pdf'}));
                                    }
                                },
                                {
                                    text: 'Mac OS X',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/apple_mac_20170323.pdf', filename: 'appleMacOS.pdf'}));
                                    }
                                },
                                {
                                    text: 'iOS (5 and above)',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/apple_iphone_20170323.pdf', filename: 'appleIphone.pdf'}));
                                    }
                                },
                                {
                                    text: 'Android OS (4.1 to 4.3)',
                                    callback: (callbackQuery, message) => {
                                        $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/android_20170323.pdf', filename: 'androidOS.pdf'}));
                                    }
                                }

                            ]
                        },
                        {
                            text: 'Financial Assistance',
                            callback: (callbackQuery, message) => {
                                $.sendMessage('http://www.nyp.edu.sg/about-nyp/nyp-support-centre-and-services/student-support/financial-assistance.html')
                            }
                        },
                        {
                            text: 'NYP Scholarships & Study Awards',
                            callback: (callbackQuery, message) => {
                                $.sendMessage('http://www.nyp.edu.sg/admissions/full-time-diploma/scholarships-study-awards.html')
                            }
                        },
                        {
                            text: 'NYP Financial Matters & Assistance',
                            callback: (callbackQuery, message) => {
                                $.sendMessage('http://www.nyp.edu.sg/admissions/full-time-diploma/financial-matters-financial-assistance.html')
                            }
                        },
                        {
                            text: 'NYP Insurance Schemes',
                            callback: (callbackQuery, message) => {
                                $.sendMessage('http://www.nyp.edu.sg/about-nyp/nyp-support-centre-and-services/student-support/student-insurance.html')
                            }
                        }
                    ]
                }
            ]
        })
        
    }

    get routes() {
        return {
            'helpDeskCommand': 'helpdeskCommandHandler'
        };
    }
}

module.exports = HelpDeskController;
