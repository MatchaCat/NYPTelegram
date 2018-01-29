'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const Student = require('../model/student')

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
var tgid = ""
var an = ""
var pn = ""

class AuthController extends TelegramBaseController {

    authenticate($) {
        const form = {
            adminnumber: {
                q: 'Please enter your admin number.',
                error: 'Oh no, something went wrong. Please enter your admin number again.',
                validator: (message, callback) => {
                    if(this.adminNumberValidator(message.text) == true) {
                        tgid = $
                        an = message.text
                        console.log('Admin Number: ' + an)
                        console.log($.update.message.text)
                        callback(true, message.text) //you must pass the result also
                        return
                    }
                
                    callback(false)
                }
            },
            verificationemail: {
                q: 'Hooray! A verification email has been sent to ' + an + '@mymail.nyp.edu.sg, please write down the verification code here.',
                error: 'Verification code is invalid.',
                validator: (message, callback) => {
                    if(message.text == 'Firstphase') { //check with nosql server on verification code
                        //create account in sql database
                        console.log($.update.message.text)
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            },
            phonenumber: {
                q: 'Please enter your phone number in this format -- \n\n+<country code with phone number without spacing>',
                error: 'Oh no, something went wrong. Please enter your phone number again.',
                validator: (message, callback) => {
                    if(this.phoneNumberValidator(message.text) == true) {
                        pn = message.text
                        console.log('Phone Number: ' + pn)
                        callback(true, message.text) // mask everything except the country code and last 4 digits of phone number
                        return
                    }
                
                    callback(false)
                }
            },
            verificationcode: {
                q: 'A verification code has been sent to ' + $.message.text + ', please write down the verification code here.',
                error: 'Verification code is invalid.',
                validator: (message, callback) => {
                    if(message.text == 'Secondphase') { //check with nosql server on verification code
                        const webhooklink = '' //create a URL to direct user to CreateAccount.aspx for password, admin number will be sent as parameter
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            },
            password: {
                q: 'Nice! You\'re at the final step already! Click on the following link to set a password.' + 
                    '\n_Note that you will be needing to use this password whenever you try to access sensitive information through this bot._'
                     + '\n\n Please respond here with I\'M READY! to complete.'
                     + '', //append webhooklink
                error: 'Oh no, something went wrong, please try this' + '', //generate new webhooklink
                validator: (message, callback) => {
                    if(message.text == 'I\'m ready!') { 
                        //check that everything is set up properly, including account in database and code granting of NYP service access
                        callback(true, message.text)
                        return
                    }
        
                    callback(false)
                }
            },
        }
        
        $.runForm(form, (result) => {
            console.log('Authentication process flow success.')
            $.sendMessage('Congratulations! You have completed your setup and unlocked all NYP-student-entitled services! Feel free to use them')
        })
        return
    }

    grantGuest($, guest){
        //perform guest setup
    }

    get routes() {
        return {
            'authHandler': 'authenticate'
        }
    }

    //validate if user is an NYP student through Admin Number
    adminNumberValidator (adminNoArgs) {
        var validCheck = false
        const adminNoStr = adminNoArgs.toUpperCase()
        console.log('adminNoStr = ' + adminNoStr)
        const match = adminNoStr.match(/^\d{6}[A-Z]/)
        let tryAdminNo
        if (match !== null) {
            tryAdminNo = match[0]
            //then search tryAdminNo in sql for valid admin numbers.
            validCheck = true
            console.log('tryAdminNo : ' + tryAdminNo + ' validCheck : ' + validCheck)
        }
        else{
            console.log('tryAdminNo : ' + tryAdminNo + ' validCheck : ' + validCheck)
        }
        return validCheck
    }

    //validate if user is an NYP student through Admin Number
    phoneNumberValidator (phoneNoArgs) {
        var validCheck = false
        const phoneNoStr = phoneNoArgs.toUpperCase()
        console.log('phoneNoStr = ' + phoneNoStr)
        const matchSG = phoneNoStr.match(/^\+65[ -][89]\d{7}$/) //Singapore
        const matchMY = phoneNoStr.match(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/) //Malaysia
        let tryPhoneNo
        if (matchSG !== null) {
            tryPhoneNo = matchSG[0]
            validCheck = true
            console.log('tryPhoneNo : ' + tryPhoneNo + ' validCheck : ' + validCheck)
        }
        else if (matchMY !== null){
            tryPhoneNo = matchMY[0]
            validCheck = true
            console.log('tryPhoneNo : ' + tryPhoneNo + ' validCheck : ' + validCheck)
        }
        else{
            validCheck = false
        }
        return validCheck
    }
}

module.exports = AuthController