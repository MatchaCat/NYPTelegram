'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const Database = require('../controller/db')
var Connection = require('tedious').Connection
var bluebird = require('bluebird');
const kvController = require('../controller/kv')
const nodemailer = require('nodemailer')
const speakeasy = require('speakeasy')

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
var kv = bluebird.promisifyAll(new kvController())

class AuthController extends TelegramBaseController {

    authenticate($) {
        var retryCount = 3
        const form = {
            adminnumber: {
                q: 'Please enter your admin number.',
                error: 'Oh no, something went wrong. Please enter your admin number again.',
                validator: (message, callback) => {
                    if(this.adminNumberValidator($, message.text) == true) {
                        this.verificationOTP($, $.message.from.id, function(res){
                            if (res){
                                console.log("validation on admin number is true")
                                callback(true)
                            }
                        })
                    }
                    else{
                        console.log("validation on admin number is false")
                        callback(false)
                    }
                    
                }
            },
            verificationemail: {
                q: 'A verification email has been sent to your school email, please verify your email address by providing the token that is sent to you here.',
                error: 'Invalid or expired verification. Please try again.',
                validator: (message, callback) => {
                    if (this.verifyOTP($, message.text) == true){
                        callback(true)
                    }
                    else{
                        retryCount--
                        console.log(retryCount)
                        if (retryCount > 0){
                            callback(false)
                            $.sendMessage('You have ' + retryCount + ' retry attempt(s) left.')
                        }
                        else{
                            $.runInlineMenu({
                                layout: 1, //some layouting here
                                method: 'sendMessage', //here you must pass the method name
                                params: ['You have reached maximum retry attempts, do you want to start over again?'], //here you must pass the parameters for that method
                                menu: [
                                    {
                                        text: 'Yes',
                                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                            this.authenticate($)
                                        }
                                    },
                                    {
                                        text: 'No',
                                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                            process.exit()
                                        }
                                    }
                                ]
                            })
                        }
                    }
                }
            },
            password: {
                q: 'Nice! You\'re at the final step already! Please use this inline numberpad to set a password.' + 
                    '\n_Note that you will be needing to use this password whenever you try to access sensitive information through this bot._',
                error: 'Oh no, something went wrong, please try again',
                validator: (message, callback) => {
                    //create a 4 pin lock (probably try with edit message)
                    kv.kvSet('etc/usr/' + $.message.from.id + '/password', "'1234'", function(check){
                        if (check == false){
                            callback(false)
                        }
                        else{
                            //this.pushItIn(function (callback){
                                var theSacrifice = ['adminnumber', 'name', 'email', 'password', 'school', 'diploma', 'year', 'semester', 'cca', 'subjects']
        
                                var theRebirth = { //remember that there is id and acct_type
                                    adminnumber: null,
                                    name: null,
                                    email: null,
                                    password: null,
                                    school: null,
                                    diploma: null,
                                    year: null,
                                    semester: null,
                                    cca: null,
                                    subjects: null
                                }

                                for(key in theRebirth){
                                    if(theRebirth.hasOwnProperty(key)) {
                                        var keystone = key
                                        theSacrifice.forEach((element) => {
                                            if(keystone == element){
                                                console.log("this is looping..." + element)
                                                var path = "etc/usr/" + $.message.from.id + "/" + element
                                                theRebirth[keystone] = "'" + kv.kvRetrieve(path).Value + "'"
                                            }
                                        })
                                    }
                                }
                                var dbCall = bluebird.promisifyAll(new Database())

                                var config = dbCall.getConfig()
                                var connection = config.then((res) => {
                                    return new Connection(res)
                                }, (err) => {console.log("FINALPUSH.connection.then --> " + err)})
                                // Attempt to connect and execute queries if connection goes through
                                var queryResult = connection.then((res) => {
                                    res.on('connect', function(err){
                                        console.log(JSON.stringify(theRebirth))
                                        if (err) 
                                        {
                                            console.log(err)
                                        }
                                        else
                                        {
                                            var issac = [$.message.from.id, theRebirth.adminnumber, "'NYP'", theRebirth.name, theRebirth.email, theRebirth.password, theRebirth.school, theRebirth.diploma, theRebirth.year, theRebirth.semester, theRebirth.cca, theRebirth.subjects]
                                            callback(dbCall.alterDatabaseinC(res, 'Users', issac))
                                        }
                                    })
                                })
                        }
                    })
                }
            }
        }
        
        $.runForm(form, (result) => {
            console.log('Authentication process flow success.')
            $.sendMessage('*Congratulations!*\n\nYou have completed your setup and unlocked all NYP-student-entitled services! Feel free to use them', {parse_mode: 'Markdown'})
        })
        return
    }

    get routes() {
        return {
            'authHandler': 'authenticate'
        }
    }

    grantGuest($){
        var dbCall = bluebird.promisifyAll(new Database())
        //perform guest setup
        var values = [1234, "'999999Z'", "'GUEST'", 'null', 'null', 'null', 'null', 'null', 'null', 'null', 'null', 'null']

        var config = dbCall.getConfig()
        var connection = config.then((res) => {
          return new Connection(res)
        }, (err) => {console.log("grantGuest.connection.then --> " + err)})
        // Attempt to connect and execute queries if connection goes through
        var queryResult = connection.then((res) => {
          res.on('connect', function(err){
            if (err) 
              {
                  console.log(err)
              }
            else
              {
                  return dbCall.alterDatabaseinC(res, 'Users', values)
              }
          })
        })
        return queryResult
    }

    //validate if user is an NYP student through Admin Number
    adminNumberValidator ($, adminNoArgs) {
        var validCheck = true
        const adminNoStr = adminNoArgs.toUpperCase()
        const match = adminNoStr.match(/^\d{6}[A-Z]/)
        let tryAdminNo
        if (match !== null) {
            tryAdminNo = match[0]
            //then search tryAdminNo in sql for valid admin numbers.
            var dbCall = bluebird.promisifyAll(new Database())
            var config = dbCall.getConfig()
            var connection = config.then((res) => {
                return new Connection(res)
            }, (err) => {console.log("adminNumberValidator.connection.then --> " + err)})
            // Attempt to connect and execute queries if connection goes through
            var queryResult = connection.then((res) => {
                res.on('connect', function(err){
                    if (err) 
                    {
                        console.log(err)
                    }
                    else
                    {
                        return dbCall.queryDatabase(res, 'NYP', 'ADMINNO', tryAdminNo, function(res){
                            if (res !== undefined){
                                var studParticulars = res.split("/")
                                console.log("studParticulars in retrieve() = " + JSON.stringify(studParticulars))
                                var studEntry =  {
                                    adminnumber: studParticulars[0],
                                    name: studParticulars[1],
                                    email: studParticulars[2],
                                    school: studParticulars[3],
                                    diploma: studParticulars[4],
                                    year: studParticulars[5],
                                    semester: studParticulars[6],
                                    cca: studParticulars[7],
                                    subjects: studParticulars[8]
                                }
                                kv.kvSet('etc/usr/' + $.message.from.id + '/adminnumber', studEntry.adminnumber, function(check){
                                    if(check == true){
                                        kv.kvSet('etc/usr/' + $.message.from.id + '/name', studEntry.name, function(check){
                                            if(check == true){
                                                kv.kvSet('etc/usr/' + $.message.from.id + '/email', studEntry.email, function(check){
                                                    if(check == true){
                                                        kv.kvSet('etc/usr/' + $.message.from.id + '/school', studEntry.school, function(check){
                                                            if(check == true){
                                                                kv.kvSet('etc/usr/' + $.message.from.id + '/diploma', studEntry.diploma, function(check){
                                                                    if(check == true){
                                                                        kv.kvSet('etc/usr/' + $.message.from.id + '/year', studEntry.year, function(check){
                                                                            if(check == true){
                                                                                kv.kvSet('etc/usr/' + $.message.from.id + '/semester', studEntry.semester, function(check){
                                                                                    if(check == true){
                                                                                        kv.kvSet('etc/usr/' + $.message.from.id + '/cca', studEntry.cca, function(check){
                                                                                            if(check == true){
                                                                                                kv.kvSet('etc/usr/' + $.message.from.id + '/subjects', studEntry.subjects, function(check){
                                                                                                    if (check == true){
                                                                                                        return true
                                                                                                    }
                                                                                                    else{
                                                                                                        return false
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                            else{
                                                                                                return false
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                    else{
                                                                                        return false
                                                                                    }
                                                                                })
                                                                            }
                                                                            else{
                                                                                return false
                                                                            }
                                                                        })
                                                                    }
                                                                    else{
                                                                        return false
                                                                    }
                                                                })
                                                            }
                                                            else{
                                                                return false
                                                            }
                                                        })
                                                    }
                                                    else{
                                                        return false
                                                    }
                                                })
                                            }
                                            else{
                                                return false
                                            }
                                        })
                                    }
                                    else{
                                        return false
                                    }
                                })
                                return true
                            }
                            else{
                                console.log("ELSE on SPL: " + res)
                                return false
                            }
                        })
                    }
                })
            })
            validCheck = true
            console.log('tryAdminNo : ' + tryAdminNo + ' validCheck : ' + validCheck)
        }
        else{
            console.log('tryAdminNo : ' + tryAdminNo + ' validCheck : ' + validCheck)
        }
        return validCheck
    }

    verifyOTP($, input) {
        var path = 'etc/usr/' + $.message.from.id + '/secret'
        var secret = kv.kvRetrieve(path)
        var cache = secret.then((secret) => {
            console.log(secret.Value)
            var tokenDelta = speakeasy.totp.verifyDelta({
                secret: secret.Value,
                encoding: 'base32',
                token: input,
                window: 2
            })
            if (tokenDelta == undefined) {
                console.log("TOKENDELTA FAILED --> " + tokenDelta)
                return false
            }
            else {
                console.log("TOKENDELTA SUCCEED --> " + tokenDelta)
                return true
            }
        })
        return true
    }

    pushItIn(callback){
        var theSacrifice = ['adminnumber', 'name', 'email', 'password', 'school', 'diploma', 'year', 'semester', 'cca', 'subjects']
        
        var theRebirth = { //remember that there is id and acct_type
            adminnumber: null,
            name: null,
            email: null,
            password: null,
            school: null,
            diploma: null,
            year: null,
            semester: null,
            cca: null,
            subjects: null
        }

        theSacrifice.foreach(element => {
            var path = "etc/usr/" + $.message.from.id + "/" + element
            theRebirth[element] = kv.kvRetrieve(path).Value
        })
        callback(theRebirth)
    }

    verificationOTP($, pathend, callback){
        var secret = speakeasy.generateSecret()
        var path = 'etc/usr/' + pathend + '/secret'
        kv.kvSet(path, secret.base32, function(check){
            if (check == true){
                const transporter = nodemailer.createTransport({
                    service: process.env.NODEMAILER_TRANSPORT_SERVICE,
                    auth: {
                        user: process.env.NODEMAILER_TRANSPORT_USER,
                        pass: process.env.NODEMAILER_TRANSPORT_PASS
                    }
                })

                var token = speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32'
                })

                var jsonBody = {
                    "update_id": $.update.updateId + 1,
                    "message":{
                      "date": $.message.date + 10,
                      "chat":{
                         "last_name": $.message.from.lastName,
                         "type": "private",
                         "id": $.message.from.id,
                         "first_name": $.message.from.firstName,
                         "username": $.message.from.username
                      },
                      "message_id": $.message.messageId + 1,
                      "from":{
                         "last_name": $.message.from.lastName,
                         "id": $.message.from.id,
                         "first_name": $.message.from.firstName,
                         "username": $.message.from.username
                      },
                      "text": token
                    }
                }

                var webhookverify = process.env.WEBHOOK_URL + "/" + process.env.TELEGRAM_BOT_KEY + "/"

                var mailOptions = {
                    from: 'startelegrambot@gmail.com',
                    to: 'xiiaogene@gmail.com',
                    subject: 'Verification for NYPInsights bot setup.',
                    html: `
                    <body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
                    
                    // <script>
                    //     function myFunction() {
                    //         var formData = new FormData();

                    //         var content = '${jsonBody}';
                    //         var blob = new Blob([content], { Content-Type: "application/json"});

                    //         formData.append("webhookQuery", blob);

                    //         var request = new XMLHttpRequest();
                    //         request.open("POST", "${webhookverify}");
                    //         request.send(formData);
                    //     }
                    // </script>

                    <table class=" main contenttable" align="center" style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;width: 600px;">
                            <tr>
                                <td class="border" style="border-collapse: collapse;border: 1px solid #eeeff0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                    <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                        <tr>
                                            <td colspan="4" valign="top" class="image-section" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff;border-bottom: 4px solid #00a5b5">
                                                <a href="https://tenable.com"><img class="top-image" src="http://www.igssgan.com/wp-content/uploads/2015/09/Nanyang-Polytechnic-Logo.jpg" style="line-height: 1;width: 600px;" alt="Nanyang Polytechnic"></a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td valign="top" class="side title" style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
                                                <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                                    <tr>
                                                        <td class="head-title" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 28px;line-height: 34px;font-weight: bold; text-align: center;">
                                                            <div class="mktEditable" id="main_title">
                                                                Hey, this is from NYPromise!
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="sub-title" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;padding-top:5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 18px;line-height: 29px;font-weight: bold;text-align: center;">
                                                        <div class="mktEditable" id="intro_title">
                                                            Your verification Code is:
                                                        </div></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="top-padding" style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="grey-block" style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff; text-align:center;">
                                                        <div class="mktEditable" id="cta">
                                                        <a style="color:#ffffff; background-color: #ff8300;  border: 10px solid #ff8300; border-radius: 3px; text-decoration:none; href='#'">${token}</a>     
                                                        </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="top-padding" style="border-collapse: collapse;border: 0;margin: 0;padding: 15px 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 21px;">
                                                            <hr size="1" color="#eeeff0">
                                                        </td>
                                                    </tr>
                                                    <tr>
                                            <td valign="top" align="center" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                                <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                                    <tr>
                                                        <td align="center" valign="middle" class="social" style="border-collapse: collapse;border: 0;margin: 0;padding: 10px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;text-align: center;">
                                                            <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                                                <tr>
                                                                    <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://www.tenable.com/blog"><img src="https://info.tenable.com/rs/tenable/images/rss-teal.png"></a></td>
                                                        <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://twitter.com/tenablesecurity"><img src="https://info.tenable.com/rs/tenable/images/twitter-teal.png"></a></td>
                                                        <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://www.facebook.com/Tenable.Inc"><img src="https://info.tenable.com/rs/tenable/images/facebook-teal.png"></a></td>
                                                        <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://www.youtube.com/tenablesecurity"><img src="https://info.tenable.com/rs/tenable/images/youtube-teal.png"></a></td>
                                                        <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://www.linkedin.com/company/tenable-network-security"><img src="https://info.tenable.com/rs/tenable/images/linkedin-teal.png"></a></td>
                                                        <td style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;"><a href="https://plus.google.com/107158297098429070217"><img src="https://info.tenable.com/rs/tenable/images/google-teal.png"></a></td>
                    
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr bgcolor="#fff" style="border-top: 4px solid #00a5b5;">
                                            <td valign="top" class="footer" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background: #fff;text-align: center;">
                                                <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                                    <tr>
                                                        <td class="inside-footer" align="center" valign="middle" style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 12px;line-height: 16px;vertical-align: middle;text-align: center;width: 580px;">
                    <div id="address" class="mktEditable">
                                                            <b>Nanyang Polytechnic</b><br>
                                                            180 Ang Mo Kio Avenue 8 <br>  569830 <br> Singapore<br>
                                                <a style="color: #00a5b5;" href="https://www.tenable.com/contact-tenable">Contact Us</a>
                    </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                      </body>`
                }
    
                transporter.sendMail(mailOptions, (error, info) =>{
                    if (error) {
                        return console.log('Something wrong with the mailer --> ' + error)
                    }
                    else{
                        callback(secret)
                    }
                    console.log('Message sent: %s' + info.messageId)
                    console.log('Preview URL: %s' + nodemailer.getTestMessageUrl(info))
                })
            }
            else{
                console.log(check)
            }
        })
    }
}

module.exports = AuthController