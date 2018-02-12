'use strict';

const Telegram = require('telegram-node-bot');
const nodemailer = require('nodemailer');
const validator = require('validator');
const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_TRANSPORT_SERVICE,
    auth: {
           user: process.env.NODEMAILER_TRANSPORT_USER,
           pass: process.env.NODEMAILER_TRANSPORT_PASS
       }
   });

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_CONNECTION_STRING;


class FeedbackController extends Telegram.TelegramBaseController {
    submitFeedbackHandler($) {

        $.sendMessage('Hi, I am your feeback bot who will be passing feedbacks back to the devlopers. We would appreciate all feedbacks. Please help us improve :)');
        const form = {
            Question1: {
                q: 'How well did the app help to serve your goals??',
                error: 'Sorry, wrong input. Use the input provided.',
                keyboard: [['Excellent'],['Good'],['Bad'],['Terrible']],
                one_time_keyboard: true,
                validator: (message, callback) => {
                    if(message.text == "/cancel"){
                        process.exit()
                    }
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
                    if(message.text == "/cancel"){
                        process.exit()
                    }
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
                    if(message.text == "/cancel"){
                        process.exit()
                    }
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
                <p> Admin No: 152287U </p>
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
                var db = client.db(process.env.MONGODB_CONNECTION_STRING_DB);
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
        get routes() {
            return {
                'submitFeedbackCommand': 'submitFeedbackHandler'
            };
        }
    }

module.exports = FeedbackController;