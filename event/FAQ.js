'use strict';

const Telegram = require('telegram-node-bot');

class FAQController extends Telegram.TelegramBaseController {
    FAQCommandHandler($) {
        $.runInlineMenu({
            layout: 1, //some layouting here
            method: 'sendMessage', //here you must pass the method name
            params: ['Which category is your question about'], //here you must pass the parameters for that method
            menu: [
                {
                    text: 'Wireless@NYP',
                    message: 'Which category is your question about?',
                    layout: 2,
                    menu: [
                        {
                            text: 'Microsoft Windows 10 ',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win10_20170323.pdf', filename: 'win10.pdf' }));
                            }
                        },
                        {
                            text: 'Microsoft Windows 8 ',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win8_20170323.pdf', filename: 'win8.pdf' }));

                            }
                        },
                        {
                            text: 'Microsoft Windows 7',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/win7_20170323.pdf', filename: 'win7.pdf' }));
                            }
                        },
                        {
                            text: 'Mac OS X',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/apple_mac_20170323.pdf', filename: 'appleMacOS.pdf' }));
                            }
                        },
                        {
                            text: 'iOS (5 and above)',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/apple_iphone_20170323.pdf', filename: 'appleIphone.pdf' }));
                            }
                        },
                        {
                            text: 'Android OS (4.1 to 4.3)',
                            callback: (callbackQuery, message) => {
                                $.sendDocument(({ url: 'http://www.nyp.edu.sg/content/dam/nyp/about-nyp/nyp-support-centre-and-services/computer-and-network-centre/wireless-nyp/get-connected/android_20170323.pdf', filename: 'androidOS.pdf' }));
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
        })
    }

    get routes() {
        return {
            'FAQCommand': 'FAQCommandHandler'
        };
    }
}

module.exports = FAQController;
