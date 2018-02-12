'use strict';

const Telegram = require('telegram-node-bot');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var dotenv = require('dotenv').config();
var aes256 = require('aes256');
var text2png = require('text2png');
var watermark = require('dynamic-watermark');
var fs = require('fs');
const steganographie = require('steganographie');
const speakeasy = require("speakeasy");
const nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_CONNECTION_STRING;
var config = {
    userName: process.env.AZURE_CONNECTION_CONFIG_USERNAME,
    password: process.env.AZURE_CONNECTION_CONFIG_PASSWORD,
    server: process.env.AZURE_CONNECTION_CONFIG_SERVER,
    options: {
        database: process.env.AZURE_CONNECTION_CONFIG_DB,
        encrypt: true,
    }
}

const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_TRANSPORT_SERVICE,
    auth: {
        user: process.env.NODEMAILER_TRANSPORT_USER,
        pass: process.env.NODEMAILER_TRANSPORT_PASS
    }
});

class ResultController extends Telegram.TelegramBaseController {

    viewAllSemResultCommandHandler($) {
        let semresult = [];
        var key = "h4Xz8MVGimfSvG7vkCfushbx7O67Xazw";
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db(process.env.MONGODB_CONNECTION_STRING_DB);
            var query = { AdminNo: "152287U" };
            db.collection("Key").find(query).toArray(function (err, result) {
                if (err) throw err;
                console.log(result[0].Key);
                key = result[0].Key;
                client.close();
            });
        });
        var connection = new Connection(config);
        connection.on("connect", function (err) {
            if (err) {
                console.log(err);
            }
            else {
                $.runInlineMenu({
                    layout: 2, //some layouting here
                    method: 'sendMessage', //here you must pass the method name
                    params: ['Select the Semester!!'], //here you must pass the parameters for that method
                    menu: [
                        {
                            text: 'Year 1 Sem 1',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '1', '1')

                            }
                        },
                        {
                            text: 'Year 1 Sem 2',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '1', '2')

                            }
                        },
                        {
                            text: 'Year 2 Sem 1',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '2', '1')

                            }
                        },
                        {
                            text: 'Year 2 Sem 2',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                //getSelectedSemResult($, connection, semresult, '2', '2', key)
                                verifyUsingOTP($, key, connection, semresult, '2', '2')

                            }
                        },
                        {
                            text: 'Year 3 Sem 1',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '3', '1')

                            }
                        },
                        {
                            text: 'Year 3 Sem 2',
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '3', '2')
                            }
                        }, {
                            text: 'All Semester', //text of the button
                            callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                                verifyUsingOTP($, key, connection, semresult, '0', '0')
                            }
                        }
                    ]
                })
            }

        });
    }

    viewSelectedSemResultHandler($) {
        console.log('HI');
    }

    get routes() {
        return {
            'viewAllSemResultCommand': 'viewAllSemResultCommandHandler'
        };
    }



}

module.exports = ResultController;

//OTP 2FA AUTHENTICATION
//=======================
function verifyUsingOTP($, key, connection, semresult, year, sem) {
    sendOTP(function (secret) {
        const form = {
            Question1: {
                q: 'Please verify using the token that will be sent to your email!!',
                error: 'Sorry, token is invalid or has expired!!',
                validator: (message, callback) => {
                    if(message.text == "/cancel"){
                        process.exit()
                    }
                    var verified = verifyOTP(message.text, secret);
                    console.log(verified + "VERIFIED")
                    //verifyOTP(function (result) {
                    //},message.text, secret)
                    if (verified == true) {
                        callback(true, message.text)
                        return
                    } else {
                        callback(false)
                    }

                }
            }
        }
        $.runForm(form, (result) => {
            var x = year + sem;
            console.log(x);
            switch (x) {
                case "00":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getAllSem($, connection, semresult, key); });
                    break;
                case "11":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
                case "12":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
                case "21":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
                case "22":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
                case "31":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
                case "32":
                    $.sendMessage('Successful Verification', { parse_mode: 'Markdown' }).then(otp => { getSelectedSemResult($, connection, semresult, year, sem, key) });
                    break;
            }
        })
    });


}

function sendOTP(callback) {
    var secret = speakeasy.generateSecret({ length: 20 });
    var token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
    });
    const mailOptions = {
        from: 'TelegramOtpMaster@gmail.com', // sender address
        to: 'yippyjiacheng@hotmail.com', // list of receivers
        subject: 'OTP MASTER', // Subject line
        html: `
        <body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
      
        <table class=" main contenttable" align="center" style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;width: 600px;">
                <tr>
                    <td class="border" style="border-collapse: collapse;border: 1px solid #eeeff0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                        <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                            <tr>
                                <td colspan="4" valign="top" class="image-section" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff;border-bottom: 4px solid #00a5b5">
                                    <a href="https://tenable.com"><img class="top-image" src="http://www.igssgan.com/wp-content/uploads/2015/09/Nanyang-Polytechnic-Logo.jpg" style="line-height: 1;width: 600px;" alt="Tenable Network Security"></a>
                                </td>
                            </tr>
                            <tr>
                                <td valign="top" class="side title" style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
                                    <table style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                        <tr>
                                            <td class="head-title" style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 28px;line-height: 34px;font-weight: bold; text-align: center;">
                                                <div class="mktEditable" id="main_title">
                                                    Hi there, i am the Security Master.
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
                                            <a style="color:#ffffff; background-color: #ff8300;  border: 10px solid #ff8300; border-radius: 3px; text-decoration:none;" href="#">${token}</a>     
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
          </body>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
    callback(secret)
}

function verifyOTP(input, secret) {
    var tokenDelta = speakeasy.totp.verifyDelta({
        secret: secret.base32,
        encoding: 'base32',
        token: input,
        window: 2
    });
    if (tokenDelta == undefined) {
        return false
    }
    else {
        return true
    }
}

//VIEW ALL SEMESTER RESULTS
//=========================
function getAllSem($, connection, semresult, key) {
    let mainText = '*Your Results for all Sememsters:*';
    let year1Sem1 = '\n\nYear 1 Sem 1:\n';
    let year1Sem2 = '\n\nYear 1 Sem 2:\n';
    let year2Sem1 = '\n\nYear 2 Sem 1:\n';
    let year2Sem2 = '\n\nYear 2 Sem 2:\n';
    let year3Sem1 = '\n\nYear 3 Sem 1:\n';
    let year3Sem2 = '\n\nYear 3 Sem 2:\n';
    let accumulatedGpa = '\n Your Accumlated GPA is '
    var totalCreditMulPoint = 0;
    var totalModuleCredit = 0;
    var request = new Request("select Subject,Sem,Year,Type,Credits,Grade,GradePoint from Subjects WHERE AdminNo ='152287U'", function (err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' row(s) returned');
            //console.log(semresult);
            for (var item of semresult) {
                var decryptedSub = aes256.decrypt(key, item["Subject"]);
                var decryptedType = aes256.decrypt(key, item["Type"]);
                var decryptedCredit = aes256.decrypt(key, item["Credits"]);
                var decryptedGrade = aes256.decrypt(key, item["Grade"]);
                var decryptedGradePoint = aes256.decrypt(key, item["GradePoint"]);
                var x = item["Year"] + '' + item["Sem"];
                //console.log(x);
                switch (x) {
                    case "11":
                        year1Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "12":
                        year1Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "21":
                        year2Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "22":
                        year2Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "31":
                        year3Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "32":
                        year3Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    default:
                        console.log("No year or sem is similar as stated in DB");
                }
                if (decryptedType == "CM") {
                    console.log(parseInt(decryptedCredit) + 'credit')
                    console.log(parseInt(decryptedGradePoint) + 'gp')
                    totalCreditMulPoint += (parseInt(decryptedCredit) * parseFloat(decryptedGradePoint));
                    totalModuleCredit += parseInt(decryptedCredit);
                }
            }
            console.log(totalCreditMulPoint + ' MULPOINT')
            console.log(totalModuleCredit + ' module credit')
            accumulatedGpa += `*` + (totalCreditMulPoint / totalModuleCredit).toFixed(2) + `*`;
            var resulttext = mainText + year1Sem1 + year1Sem2 + year2Sem1 + year2Sem2 + year3Sem1 + year3Sem2 + accumulatedGpa;
            //$.sendMessage(mainText +  year1Sem1 +  year1Sem2 +  year2Sem1 +  year2Sem2 +  year3Sem1 +  year3Sem2 + accumulatedGpa, { parse_mode: 'Markdown' });
            watermarkResult($, resulttext, 1, key);
        }
    });

    request.on('row', function (columns) {
        var row = {};
        columns.forEach(function (column) {
            row[column.metadata.colName] = column.value;
        });
        semresult.push(row);

    });
    connection.execSql(request);
    semresult = [];
}

//VIEW INDIVIDUAL SEMESTER RESULT
//===============================
function getSelectedSemResult($, connection, semresult, year, sem, key) {
    let year1Sem1 = '';
    let year1Sem2 = '';
    let year2Sem1 = '';
    let year2Sem2 = '';
    let year3Sem1 = '';
    let year3Sem2 = '';
    let accumulatedGpa = '\n Your chosen semester\'s GPA is '
    var totalCreditMulPoint = 0;
    var totalModuleCredit = 0;
    var request = new Request(`select Subject,Sem,Year,Type,Credits,Grade,GradePoint from Subjects WHERE AdminNo ='152287U' and Sem = ${sem} and Year = ${year}`, function (err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' row(s) returned');
            console.log(semresult);
            for (var item of semresult) {
                var decryptedSub = aes256.decrypt(key, item["Subject"]);
                var decryptedType = aes256.decrypt(key, item["Type"]);
                var decryptedCredit = aes256.decrypt(key, item["Credits"]);
                var decryptedGrade = aes256.decrypt(key, item["Grade"]);
                var decryptedGradePoint = aes256.decrypt(key, item["GradePoint"]);
                var x = item["Year"] + '' + item["Sem"];
                console.log(x);
                switch (x) {
                    case "11":
                        year1Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "12":
                        year1Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "21":
                        year2Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "22":
                        year2Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "31":
                        year3Sem1 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    case "32":
                        year3Sem2 += `${decryptedSub} - ${decryptedGrade}\n`;
                        break;
                    default:
                        console.log("No year or sem is similar as stated in DB");
                }
                if (decryptedType == "CM") {
                    totalCreditMulPoint += (parseInt(decryptedCredit) * parseFloat(decryptedGradePoint));
                    totalModuleCredit += parseInt(decryptedCredit);
                }
            }
            console.log(totalCreditMulPoint)
            console.log(totalModuleCredit)
            accumulatedGpa += `*` + (totalCreditMulPoint / totalModuleCredit).toFixed(2) + `*`;
            var resulttext = `Year ` + item["Year"] + ` Sem ` + item["Sem"] + `:\n` + year1Sem1 + year1Sem2 + year2Sem1 + year2Sem2 + year3Sem1 + year3Sem2 + accumulatedGpa
            // /$.sendMessage(`\n\n*Year `+ item["Year"] + ` Sem `+ item["Sem"] +`*:\n` + year1Sem1 +  year1Sem2 +  year2Sem1 +  year2Sem2 +  year3Sem1 +  year3Sem2 + accumulatedGpa, { parse_mode: 'Markdown' });
            watermarkResult($, resulttext, 0, key);
        }
    });

    request.on('row', function (columns) {
        var row = {};
        columns.forEach(function (column) {
            row[column.metadata.colName] = column.value;
        });
        semresult.push(row);

    });
    connection.execSql(request);
    semresult = [];
}

function watermarkResult($, resulttext, value, key) {
    if (value = 1) {
        var fontDetail = '35px sans-serif'
    }
    else {
        var fontDetail = '5px sans-serif'
    }
    try {
        fs.writeFileSync('pic/Result.png', text2png(resulttext, {
            font: fontDetail,
            textColor: 'black',
            bgColor: '#f2f2f2',
            lineSpacing: 10,
            padding: 20
        }));
        var options = {
            source: "pic/Result.png",
            logo: "pic/nyp.png", // This is optional if you have provided text Watermark
            destination: "pic/Result.png",
            position: "right-top",    // left-top, left-bottom, right-top, right-bottom
            type: "image",   // text or image
        }
        watermark.embed(options, function (status) {
            //Do what you want to do here
            var randomstring = require("randomstring");
            var plaintext = randomstring.generate();
            var encrypted = aes256.encrypt(key, plaintext);
            console.log(encrypted);
            steganographie.conceal({
                input: 'pic/Result.png',
                output: 'pic/Result_concealed.png',
                method: 'simple',
                text: encrypted,
            }, (err, res) => {
                if (err) {
                    console.log('Hmm, there is an error with conceal: ' + err);
                }
                console.log(res)
                $.sendPhoto({ path: 'pic/Result_concealed.png' })
                insertConcealed(encrypted)
            });
        })
    } catch (e) {
        console.log("Cannot write file ", e);
    }
}

//INSERT UNIQUE ID OF IMAGE TO MONGODB
function insertConcealed(encryptedText) {
    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db(process.env.MONGODB_CONNECTION_STRING_DB);
        var myobj = { AdminNo: "152287U", Concealed: encryptedText };
        db.collection("ImageConceal").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        });
    });
}