'use strict';

const Telegram = require('telegram-node-bot');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const aes256 = require('aes256');
const validator = require('validator');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config();
const delay = require('delay');
const fs = require('fs');
const text2png = require('text2png');
const watermark = require('dynamic-watermark');
const steganographie = require('steganographie');
const speakeasy = require("speakeasy");
const nodemailer = require('nodemailer');

const url = process.env.MONGODB_CONNECTION_STRING;
const config = {
    userName: process.env.AZURE_CONNECTION_CONFIG_USERNAME,
    password: process.env.AZURE_CONNECTION_CONFIG_PASSWORD,
    server: process.env.AZURE_CONNECTION_CONFIG_SERVER,
    options: {
        database: process.env.AZURE_CONNECTION_CONFIG_DB,
        encrypt: true,
    }
}
let adminNO = '152287U'

const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_TRANSPORT_SERVICE,
    auth: {
        user: process.env.NODEMAILER_TRANSPORT_USER,
        pass: process.env.NODEMAILER_TRANSPORT_PASS
    }
});

class CCAController extends Telegram.TelegramBaseController {
    viewCcaHandler($) {
        var key = "";
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db(process.env.MONGODB_CONNECTION_STRING_DB);
            var query = { AdminNo: "152287U" };
            db.collection("Key").find(query).toArray(function (err, result) {
                if (err) throw err;
                console.log(result[0].Key);
                key = result[0].Key;
                client.close();
                delay(10).then(() => {
                    ccaOptions($, key);
                });

            });
        });

    }

    get routes() {
        return {
            'viewCCACommand': 'viewCcaHandler'
        };
    }

}

module.exports = CCAController;
//CCA OPTIONS
//============
function ccaOptions($, key) {

    $.runInlineMenu({
        layout: 1, //some layouting here
        method: 'sendMessage', //here you must pass the method name
        params: ['What would you like to do??'], //here you must pass the parameters for that method
        menu: [
            {
                text: 'View CCA Records',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    verifyUsingOTP($, key)
                }
            },
            {
                text: 'View Member List',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    ViewMemberList($, key)


                }
            },
            {
                text: 'Send Reminder(Broadcast)',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    SendReminder($, key)

                }
            }
        ]
    })
}

//OTP 2FA AUTHENTICATION
//=======================
function verifyUsingOTP($, key) {
    sendOTP(function (secret) {
        const form = {
            Question1: {
                q: 'Please verify using the token that will be sent to your email!!',
                error: 'Sorry, token is invalid or has expired!!',
                validator: (message, callback) => {
                    if (message.text == "/cancel") {
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
            console.log("Succeessful Verification")
            $.sendMessage('Succeessful Verification', { parse_mode: 'Markdown' }).then(otp => { viewCCARecords($, key) });
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
//VIEW CCA FUNCTIONS
//==================
function viewCCARecords($, key) {
    let mainText = 'Your Overall CCA Records:\n';
    let participation = '\n\nParticipation:\n';
    let enrichment = '\n\nEnrichment:\n';
    let achievement = '\n\nAchievement:\n';
    let representation = '\n\nRepresentation:\n';
    let leadership = '\n\nLeadership:\n';
    let service = '\n\nService:\n';
    let totalCcaPoint = "\nYour total CCA Points are ";
    let ccaPoint = 0;

    var connection = new Connection(config);
    connection.on("connect", function (err) {

        let ccaRecords = [];

        if (err) {
            console.log(err);
        }
        else {
            var request = new Request(`select Name,Date,Point,Classification from CCARecord WHERE AdminNo ='${adminNO}'`, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned');
                    console.log(ccaRecords);
                    for (var item of ccaRecords) {
                        var decryptedName = aes256.decrypt(key, item["Name"]);
                        var decryptedDate = aes256.decrypt(key, item["Date"]);
                        var decryptedPoint = aes256.decrypt(key, item["Point"]);
                        var decryptedClass = aes256.decrypt(key, item["Classification"]);
                        switch (decryptedClass) {
                            case "P":
                                participation += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            case "E":
                                enrichment += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            case "A":
                                achievement += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            case "R":
                                representation += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            case "L":
                                leadership += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            case "S":
                                service += `${decryptedName}(${decryptedDate}):${decryptedPoint}points\n`;
                                break;
                            default:
                                console.log("CCA found not under any classification");
                        }
                        ccaPoint += parseInt(decryptedPoint);
                    }
                    //totalCcaPoint += `*` + ccaPoint + `*`;
                    //$.sendMessage(mainText + participation + enrichment + achievement + representation + leadership + service + totalCcaPoint, { parse_mode: 'Markdown' });
                    totalCcaPoint += ccaPoint;
                    try {
                        fs.writeFileSync('pic/CCA.png', text2png(mainText + participation + enrichment + achievement + representation + leadership + service + totalCcaPoint, {
                            font: '35px sans-serif',
                            textColor: 'black',
                            bgColor: '#f2f2f2',
                            lineSpacing: 10,
                            padding: 20
                        }));
                        var options = {
                            source: 'pic/CCA.png',
                            logo: 'pic/nyp.png', // This is optional if you have provided text Watermark
                            destination: 'pic/CCA.png',
                            position: "right-top",    // left-top, left-bottom, right-top, right-bottom
                            type: "image",   // text or image
                        }
                        watermark.embed(options, function (status) {
                            //Do what you want to do here
                            console.log(status);
                            var randomstring = require("randomstring");
                            var plaintext = randomstring.generate();
                            var encrypted = aes256.encrypt(key, plaintext);
                            console.log(encrypted);
                            steganographie.conceal({
                                input: 'pic/CCA.png',
                                output: 'pic/CCA_concealed.png',
                                method: 'simple',
                                text: encrypted,
                            }, (err, res) => {
                                if (err) {
                                    console.log('Hmm, there is an error with conceal: ' + err);
                                }
                                console.log(res)
                                $.sendPhoto({ path: 'pic/CCA_concealed.png' })
                                insertConcealed(encrypted)
                            });
                        })
                    } catch (e) {
                        console.log("Cannot write file ", e);
                    }
                }
            });

            request.on('row', function (columns) {
                var row = {};
                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });
                ccaRecords.push(row);

            });
            connection.execSql(request);
        }

    });

}

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

//VIEW MEMBER LIST FUNCTIONS
function ViewMemberList($, key) {
    var connection = new Connection(config);
    connection.on("connect", function (err) {

        let Cca = [];

        if (err) {
            console.log(err);
        }
        else {
            var request = new Request(`select CCA from Users WHERE ADMINNO ='${adminNO}'`, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned');
                    console.log(Cca);
                    sendMemberList($, key, Cca);

                }
            });
            request.on('row', function (columns) {
                var row = {};
                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });
                Cca.push(row);

            });
            connection.execSql(request);

        }

    });
}

function sendMemberList($, key, Cca) {
    let memberListOuput = '*CCA Member List:*\n\n';
    let memberListNone = '*CCA Member List:*\n\n*NO MEMBERS DETECTED*!!!!';
    let MemberList = [];
    let counter = 1
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select Name,Position from Member WHERE CCA ='${Cca[0].CCA}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned !! at SENDMEMBER');
                console.log(MemberList);
                if (rowCount > 0) {
                    for (var item of MemberList) {
                        memberListOuput += `${counter}` + '. ' + `${item["Name"]}\t\t|\t\t${item["Position"]}\n`
                        counter++;
                    }
                    $.sendMessage(memberListOuput, { parse_mode: 'Markdown' }).then(memberListOuput => { MemberListOptions($, key, Cca) });
                }
                else {
                    $.sendMessage(memberListNone, { parse_mode: 'Markdown' }).then(memberListOuput => { MemberListOptions($, key, Cca) });
                }
            }
        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            MemberList.push(row);

        });
        connection.execSql(request);
    });

}

//MEMBER OPTIONS AFTER VIEWING MEM LIST
//=====================================
function MemberListOptions($, key, Cca) {
    $.runInlineMenu({
        layout: 3, //some layouting here
        method: 'sendMessage', //here you must pass the method name
        params: ['Any action You would like to take?'], //here you must pass the parameters for that method
        menu: [
            {
                text: 'Add Member',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    addMember($, key, Cca)

                }
            },
            {
                text: 'Delete Member',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    deleteMember($, key);

                }
            },
            {
                text: 'View Member Info',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    viewMemberInfo($, key);
                }
            },
            {
                text: 'I am Done!',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    $.sendMessage("Thank You for using our CCA features!");

                }
            }
        ]
    })
}

//ADDING MEMBER FUNCTIONS
//=======================
function addMember($, key, Cca) {
    const form = {
        addMember: {
            q: 'Please enter the Admin Number and Role in this format:AdminNO Role\n\nRole:\n1 - President\n2 - Vice-President\n3 - Logistics\n4 - Treasurer\n5 - Secretary\n6 - Member',
            error: 'Either your input has restricted charatcers or the admin number/Role is wrong Please Try Again!',
            validator: (message, callback) => {
                if (message.text == "/cancel") {
                    process.exit()
                }
                var input = message.text.split(' ');
                //var check = checkMember(input);
                console.log(input[0])
                if (input[0].length == 7 && input[1].length == 1) {
                    if (validator.isAlphanumeric(input[0])) {
                        var list = [];
                        var connection = new Connection(config);
                        connection.on("connect", function (err) {
                            var request = new Request(`select NAME from Users WHERE ADMINNO ='${input[0]}'`, function (err, rowCount, rows) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(rowCount + ' row(s) returned at VALIDATION');
                                    console.log(list + "VALIDATING");
                                    checkMember(Cca, function (result) {
                                        console.log(result + "TOTO")
                                        if (rowCount == 1 && result.includes(input[0].toUpperCase()) == false) {
                                            if (validator.isNumeric(input[1]) && input[1] > 0 && input[1] < 7) {
                                                callback(true, message.text)
                                                return
                                            }
                                            else {
                                                console.log("POS NUMBER IS INVALAID")
                                            }

                                        } else {
                                            console.log("ROWCOUNT not 1 or check not true")
                                            callback(false)
                                        }
                                    });
                                }
                            });
                            request.on('row', function (columns) {
                                var row = {};
                                columns.forEach(function (column) {
                                    row[column.metadata.colName] = column.value;
                                });
                                list.push(row);

                            });
                            connection.execSql(request);
                        });

                    } else {
                        console.log(message.text)
                        callback(false)
                    }
                } else {
                    console.log(message.text)
                    callback(false)
                }
            }
        }
    }
    $.runForm(form, (result) => {
        let addedMember = result.addMember.split(' ');
        console.log(addedMember);
        var tgid;
        var name;
        var email;
        var hp;
        var sch;
        var dip;
        var cca;
        var list = [];
        var result = []
        var connection = new Connection(config);
        connection.on("connect", function (err) {
            var request = new Request(`select TGID,NAME,EMAIL,SCHOOL,DIPLOMA,CCA from Users WHERE ADMINNO ='${addedMember[0]}'`, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned at RUNFORM');
                    console.log(list);
                    if (rowCount == 0) {
                        return false
                    }
                    else {

                        for (var item of list) {
                            tgid = item["TGID"]
                            name = item["NAME"]
                            email = item["EMAIL"]
                            sch = item["SCHOOL"]
                            dip = item["DIPLOMA"]
                            cca = item["CCA"]
                            result.push(name)
                            result.push(email)
                            result.push(sch)
                            result.push(dip)
                            result.push(cca)
                            result.push(tgid)
                            var memberPos = getPosition(addedMember[1])
                            console.log(memberPos)
                            insertDB(memberPos, result, addedMember)
                            doneAdding($, key);
                        }
                    }

                }
            });
            request.on('row', function (columns) {
                var row = {};
                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });
                list.push(row);

            });
            connection.execSql(request);
        })

    });


}

function checkMember(Cca, callback) {
    var list = [];
    var result = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select AdminNo from Member WHERE CCA='${Cca}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned at CHECKING');
                for (var item of list) {
                    result.push(item["AdminNo"])
                }
                console.log(result + "CHECKING")
                callback(result)

            }
        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            list.push(row);

        });
        connection.execSql(request);
    })
}
function doneAdding($, key) {
    $.runMenu({
        message: 'Would you like to keep adding?',
        resizeKeyboard: true,
        oneTimeKeyboard: true,
        options: {
            parse_mode: 'Markdown' // in options field you can pass some additional data, like parse_mode
        },
        'Yes': () => {
            addMember($, key);
        },
        'No': () => {
            $.sendMessage('You have finishing adding!').then(() => {
                continueOrNot($, key)
            })

        }
    })
}

function continueOrNot($, key) {
    $.runMenu({
        message: 'Would you like to view the most updated list?',
        resizeKeyboard: true,
        oneTimeKeyboard: true,
        options: {
            parse_mode: 'Markdown' // in options field you can pass some additional data, like parse_mode
        },
        'Yes': () => {
            ViewMemberList($, key);
        },
        'No': () => {
            $.sendMessage('Thank you for using the CCA feature!')
        }
    })
}

function insertDB(memberPos, result, addedMember) {
    var str = addedMember[0].toUpperCase();
    var connection2 = new Connection(config);
    connection2.on("connect", function (err) {
        var request2 = new Request(`INSERT INTO Member (AdminNo,Name,Position,Email,School,Diploma,CCA,TGID) VALUES ('${str}', '${result[0]}', '${memberPos}', '${result[1]}','${result[2]}' , '${result[3]}','${result[4]}','${result[5]}');`, function (err) {
            if (err) {
                console.log(err);
            }
        });

        request2.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    console.log("inserted item is " + column.value);
                }
            });
        });
        connection2.execSql(request2);
        // request2.addParameter("ADMINNO", TYPES.NVarChar, addedMember[0]);
        // request2.addParameter('NAME', TYPES.NVarChar, result[0]);
        // request2.addParameter('POSITION', TYPES.NVarChar, addMember[1]);
        // request2.addParameter('EMAIL', TYPES.NVarChar, result[1]);
        // request2.addParameter('HP', TYPES.NVarChar, result[2]);
        // request2.addParameter('SCHOOL', TYPES.NVarChar, result[3]);
        // request2.addParameter('DIPLOMA', TYPES.NVarChar, result[4]);
        // request2.addParameter('Cca', TYPES.NVarChar, result[5]);
    });
}
function getPosition(pos) {
    var res = ''
    switch (pos) {
        case "1":
            res = 'President';
            break;
        case "2":
            res = 'Vice-President';
            break;
        case "3":
            res = 'Logistics';
            break;
        case "4":
            res = 'Treasurer';
            break;
        case "5":
            res = 'Secretary';
            break;
        case "6":
            res = 'Member';
            break;
        default:
            console.log("Number(Position) is invalid");
    }
    return res
}

//DELETING MEMBER FUNCTIONS
//=========================

function deleteMember($, key) {
    var memList;
    const form = {
        addMember: {
            q: 'Please enter the value assigned to the member.',
            error: 'Your input is INVALID. Please Try Again!',
            validator: (message, callback) => {
                if (message.text == "/cancel") {
                    process.exit()
                }
                var deleteinput = message.text;
                var ccastr;
                console.log(deleteinput)
                if (deleteinput.length == 1) {
                    getMemList(function (result) {
                        console.log(result + "result")
                        memList = result
                        console.log(memList + "TESTING")
                        if (validator.isNumeric(deleteinput) && deleteinput > 0 && deleteinput <= memList.length) {
                            console.log(memList + "Mem List")
                            deleteFromDB(deleteinput, memList);
                            callback(true, message.text)
                            return

                        } else {
                            console.log(message.text)
                            callback(false)
                        }
                    });

                } else {
                    console.log(message.text)
                    callback(false)
                }
            }
        }
    }
    $.runForm(form, (result) => {
        $.sendMessage("Successfully deleted!!").then(() => {
            continueOrNot($, key)
        })


    });
}

function getMemList(callback) {
    var list = [];
    var memList = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select CCA from Users WHERE ADMINNO ='${adminNO}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                console.log(list);

                if (rowCount > 0) {
                    var result;
                    for (var item of list) {
                        result = item["CCA"]
                    }
                    console.log(result)
                    getMembers(result, function (memResult) {
                        memList = memResult;
                        console.log(memList + "YOYO")
                        callback(memList);
                    })


                } else {
                    console.log('NO CCA FOUND');
                }
            }

        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            list.push(row);

        });
        connection.execSql(request);
    });
    // delay(800).then(() => {
    //     console.log(memList + "YOYO")

    // });

}

function getMembers(ccaValue, callback) {
    var adminNoList = [];
    var result = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select AdminNo from Member WHERE CCA ='${ccaValue}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                console.log(adminNoList);
                if (rowCount > 0) {

                    for (var item of adminNoList) {
                        result.push(item["AdminNo"])
                    }
                    console.log(result + "LALA")
                    callback(result)
                } else {
                    console.log("DELETION/VIEWING FUNCTION: Admin List empty")
                }
            }
        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            adminNoList.push(row);

        });
        connection.execSql(request);
    });
}

function deleteFromDB(input, memList) {
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`DELETE FROM Member WHERE AdminNo ='${memList[input - 1]}';`, function (err) {
            if (err) {
                console.log(err);
            } else { console.log("Successful deletion") }
            //request.addParameter("value", TYPES.NVarChar, memList[input - 1]);

        });


        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    console.log("inserted item is " + column.value);
                }
            });
        });
        connection.execSql(request);
    });
}

//VIEW MEMBER INFO FUNCTIONS
//=========================
function viewMemberInfo($, key) {
    var memList;
    const form = {
        ViewInfo: {
            q: 'Please enter the value assigned to the Member',
            error: 'Your input is INVALID. Please Try Again!',
            validator: (message, callback) => {
                if (message.text == "/cancel") {
                    process.exit()
                }
                var viewinput = message.text;
                console.log(viewinput)
                if (viewinput.length == 1) {
                    getMemList(function (result) {
                        console.log(result + "result")
                        memList = result
                        console.log(memList + "TESTING")
                        if (validator.isNumeric(viewinput) && viewinput > 0 && viewinput <= memList.length) {
                            console.log(memList + "Mem List")
                            getInfoFromDB($, key, viewinput, memList);
                            callback(true, message.text)
                            return

                        } else {
                            console.log(message.text)
                            callback(false)
                        }
                    });

                } else {
                    console.log(message.text)
                    callback(false)
                }
            }
        }
    }
    $.runForm(form, (result) => {
    });

}

function getInfoFromDB($, key, input, memList) {
    var infoList = [];
    var result = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select AdminNo,Name,Position,Email,School,Diploma from Member WHERE AdminNo ='${memList[input - 1]}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                console.log(infoList);
                if (rowCount > 0) {

                    for (var item of infoList) {
                        result.push(item["AdminNo"])
                        result.push(item["Name"])
                        result.push(item["Position"])
                        //result.push(item["Email"])
                        var mail = item["Email"]
                        mail = mail.slice(0, mail.length - 2)
                        result.push(mail)
                        result.push(item["School"])
                        result.push(item["Diploma"])
                    }
                    console.log(result + "GETINFO")
                    displayInfo($, key, result)
                } else {
                    console.log("VIEWING FUNCTION: Admin List empty")
                }
            }
        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            infoList.push(row);

        });
        connection.execSql(request);
    });
}

function displayInfo($, key, result) {
    let infoText = `Member\'s Information:\n\nAdmin Number: ${result[0]}\nName: ${result[1]}\nPosition: ${result[2]}\nEmail: ${result[3]}\nSchool: ${result[4]}\nDiploma: ${result[5]}`
    $.sendMessage(infoText).then(() => {
        doneViewing($, key)
    });
}

function doneViewing($, key) {
    $.runMenu({
        message: 'Would you like to keep viewing other member information?',
        resizeKeyboard: true,
        oneTimeKeyboard: true,
        options: {
            parse_mode: 'Markdown' // in options field you can pass some additional data, like parse_mode
        },
        'Yes': () => {
            viewMemberInfo($, key);
        },
        'No': () => {
            $.sendMessage('You have finishing Viewing!').then(() => {
                continueOrNot($, key)
            })

        }
    })
}
//SEND REMINDER FUNCTION
//======================
function SendReminder($, key) {
    const form = {
        SendReminder: {
            q: 'Please enter the message you would like your members to see!',
            error: 'Your input is INVALID. Please Try Again!',
            validator: (message, callback) => {
                if (message.text == "/cancel") {
                    process.exit()
                }
                var viewinput = message.text.split(' ');
                console.log(viewinput)
                validateString(viewinput, function (validated) {
                    console.log(validated)
                    if (message.text && validated == true) {
                        callback(true, message.text)
                        return
                    }
                    console.log("Invalid Input for reminder")
                    callback(false)

                })

            }
        }
    }
    $.runForm(form, (result) => {
        getCCA(function (cca) {
            getTGID(cca, function (tgidlist) {
                for (var item of tgidlist[0]) {
                    console.log(item + "TGID")
                    $.sendMessage('*Reminder by ' + tgidlist[1] + ':*\n' + result.SendReminder, {
                        'chat_id': item,
                        parse_mode: 'Markdown'
                    });
                }
            })
        })
    });

}

function validateString(stringArray, callback) {
    for (var i = 0; i < stringArray.length; i++) {
        console.log(stringArray[i])
        if (!validator.isAlphanumeric(stringArray[i])) {
            callback(false)
        }
    }
    callback(true)
}
function getCCA(callback) {
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        let Cca = [];
        var result = [];
        if (err) {
            console.log(err);
        }
        else {
            var request = new Request(`select Name,CCA from Users WHERE ADMINNO ='${adminNO}'`, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned');
                    console.log(Cca);
                    for (var item of Cca) {
                        result.push(item["Name"])
                        result.push(item["CCA"])
                    }
                    callback(result);

                }
            });
            request.on('row', function (columns) {
                var row = {};
                columns.forEach(function (column) {
                    row[column.metadata.colName] = column.value;
                });
                Cca.push(row);

            });
            connection.execSql(request);

        }

    });
}

function getTGID(cca, callback) {
    var tgidList = [];
    var result = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select TGID from Member WHERE CCA ='${cca[1]}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                console.log(tgidList);
                if (rowCount > 0) {

                    for (var item of tgidList) {
                        result.push(item["TGID"])
                    }
                    console.log(result + "GET TGID")
                    callback([result, cca[0]])
                } else {
                    console.log("REMINDER FUNCTION: TGID LIST empty")
                }
            }
        });
        request.on('row', function (columns) {
            var row = {};
            columns.forEach(function (column) {
                row[column.metadata.colName] = column.value;
            });
            tgidList.push(row);

        });
        connection.execSql(request);
    });
}