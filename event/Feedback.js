'use strict';

const Telegram = require('telegram-node-bot');
var nodemailer = require('nodemailer');
var validator = require('validator');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'startelegrambot@gmail.com',
           pass: 'TelegramBot123'
       }
   });

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://152287U:TelegramBot12345@nyp-telegram-shard-00-00-kqhli.mongodb.net:27017,nyp-telegram-shard-00-01-kqhli.mongodb.net:27017,nyp-telegram-shard-00-02-kqhli.mongodb.net:27017/NYP-Telegram?ssl=true&replicaSet=NYP-Telegram-shard-0&authSource=admin";



class FeedbackController extends Telegram.TelegramBaseController {
    submitFeedbackHandler($) {

        $.sendMessage('Hi, I am your feeback bot who will be passing feedbacks back to the devlopers. We would appreciate all feedbacks. Please help us improve :)');
        const form = {
            adminNo: {
                q: 'To start please state your admin number',
                error: 'Sorry, You did not pass a valid admin number. Please Try Again!',
                validator: (message, callback) => {
                    if(message.text && message.text.length == 7 && !isNaN(message.text.slice(0,5))) {
                        callback(true, message.text) //you must pass the result also
                        return
                    }
        
                    callback(false)
                }
            },
            Question1: {
                q: 'How well did the app help to serve your goals??',
                error: 'Sorry, wrong input. Use the input provided.',
                keyboard: [['Excellent'],['Good'],['Bad'],['Terrible']],
                one_time_keyboard: true,
                validator: (message, callback) => {
                    if(message.text && message.text == 'Excellent' || message.text == 'Good' || message.text == 'Bad' || message.text == 'Terrible') {
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            },
            Question2: {
                q: 'What needs to be improved??',
                error: 'Sorry, NO SPECIAL CHARACTERS ALLOWED! Only NUMBERS and LETTERS allowed.',
                validator: (message, callback) => {
                    if(message.text && validator.isAlphanumeric(message.text)) {
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            },
            Question3: {
                q: 'Given the app\'s objective of easy access to nyp portal, would you use it again??',
                error: 'Sorry, wrong input. Use the input provided.',
                keyboard: [['Yes'],['No']],
                one_time_keyboard: true,
                resize_keyboard: true,
                validator: (message, callback) => {
                    if(message.text && message.text == 'Yes' || message.text == 'No') {
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            }
        }
        
        $.runForm(form, (result) => {
            const mailOptions = {
                from: 'TelegramFeedback@gmail.com', // sender address
                to: 'yippyjiacheng@hotmail.com', // list of receivers
                subject: 'Feedback', // Subject line
                html: `<p>Hi, I am the feedback bot and here is a feedback from a user.</p>
                <p> Admin No: ${result.adminNo} </p>
                <p> Question1 Response: ${result.Question1} </p>
                <p> Question2 Response: ${result.Question2} </p>
                <p> Question3 Response: ${result.Question3} </p>`// plain text body
              };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
            });
            $.sendMessage('Thank you for your feeback!!');

            MongoClient.connect(url, function(err, client) {
                if (err) throw err;
                var db = client.db('NYP-Telegram');
                var myobj = { AdminNo: result.adminNo, Question1: result.Question1, Question2: result.Question2, Question3: result.Question3  };
                db.collection("Feedback").insertOne(myobj, function(err, res) {
                  if (err) throw err;
                  console.log("1 document inserted");
                  client.close();
                });
              });
        })
        }
        
        
        // $.sendMessage(text,{
        //     'parse_mode': 'Markdown',
        //     'reply_markup': JSON.stringify({
        //       "keyboard": [['Excellent]],
        //       "one_time_keyboard": true,
        //       "resize_keyboard": true
        //     })
        //   });
        
        

        // $.getUserSession('GpaSession')
        //     .then(GpaSession => {
        //         if (!Array.isArray(todos)) $.setUserSession('todos', [todo]);
        //         else $.setUserSession('todos', todos.concat([todo]));
        //         $.sendMessage('Added new todo!');
        //     });
        get routes() {
            return {
                'submitFeedbackCommand': 'submitFeedbackHandler'
            };
        }
    }



//     getAdminNumber($) {
//         let adminResponse = $.message.text;
//         let adminResponseDigit = $.message.text.substr(0,6);
//         let adminResponseAplha = $.message.text.substr(6,1);

//         $.waitForRequest
//         .then($ => {
//             $.getUserSession('adminSession')
//             .then(adminSession => {
//                 if (adminResponse.length == 7 || !isNaN(adminResponseDigit) ){
//                     $.setUserSession('adminSession', adminResponse);
//                     $.sendMessage('Admin Number Verfied');                           
//                 } 
//                 else {
//                     $.sendMessage('Sorry, You did not pass a valid admin number');
//                     $.sendMessage('Please try Again')
//                     this.getAdminNumber($);
//                 }
//             });
//         })
//     }

//     getResponse1(){
//         let response1 = null;
//         while(response1 = null){
//             $.runInlineMenu({
//                 layout: 2, //some layouting here
//                 method: 'sendMessage', //here you must pass the method name
//                 params: ['How well did the app help to serve your goals??'], //here you must pass the parameters for that method
//                 menu: [
//                     {
//                         text: 'Excellent', //text of the button
//                         replyToMessage: 'Excellent',
//                         callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
//                             $.getUserSession('responseSession1')
//                             .then(responseSession1 => {
//                                 response1 = '1'
//                                 $.setUserSession('responseSession1', response1);
//                                 $.sendMessage('Response Received');
//                             });
//                         }
//                     },
//                     {
//                         text: 'Bad',
//                         message: 'Bad',
//                         callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
//                             $.getUserSession('responseSession1')
//                             .then(responseSession1 => {
//                                 response = '2'
//                                 $.setUserSession('responseSession1', response);
//                                 $.sendMessage('Response Received');
//                             });
//                         }
//                     }
//                 ]
//             })
//         }
//     }

//     getResponse2(){
//         let reponse2 = null;
//         while(reponse2 = null){
//         $.runMenu({
//             message: 'Given the app\'s objective of easy access to nyp portal, would you use it again??',
//             layout: 2,
//             'Yes': () => {$.sendMessage('yupo')}, //will be on first line
//             'No': () => {} //will be on first line
//         })
//       }
//     }
// }

module.exports = FeedbackController;