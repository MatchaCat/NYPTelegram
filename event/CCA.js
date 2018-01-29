'use strict';

const Telegram = require('telegram-node-bot');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var aes256 = require('aes256');
var validator = require('validator');
var MongoClient = require('mongodb').MongoClient;
var dotenv = require('dotenv').config();

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


class CCAController extends Telegram.TelegramBaseController {
    viewCcaRecordsHandler($) {
        var key = "";
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('NYP-Telegram');
            var query = { AdminNo: "152287U" };
            db.collection("Key").find(query).toArray(function (err, result) {
                if (err) throw err;
                console.log(result[0].Key);
                key = result[0].Key;
                client.close();
            });
        });
        $.runInlineMenu({
            layout: 2, //some layouting here
            method: 'sendMessage', //here you must pass the method name
            params: ['What would you like to do??'], //here you must pass the parameters for that method
            menu: [
                {
                    text: 'viewCCARecord',
                    callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        viewCCARecords($, key)

                    }
                },
                {
                    text: 'MemberList',
                    callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        ViewMemberList($, key)


                    }
                },
                {
                    text: 'TakeAttendance',
                    callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        getSelectedSemResult($, connection, semresult, '2', '1', key)

                    }
                },
                {
                    text: 'Stock Count',
                    callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        getSelectedSemResult($, connection, semresult, '2', '2', key)

                    }
                }
            ]
        })

    }

    get routes() {
        return {
            'viewCCARecordsCommand': 'viewCcaRecordsHandler'
        };
    }
}

module.exports = CCAController;

function viewCCARecords($, key) {
    let mainText = '*Your Overall CCA Records:*\n\n';
    let participation = '\n\n*Participation:*\n';
    let enrichment = '\n\n*Enrichment:*\n';
    let achievement = '\n\n*Achievement:*\n';
    let representation = '\n\n*Representation:*\n';
    let leadership = '\n\n*Leadership:*\n';
    let service = '\n\n*Service:*\n';
    let totalCcaPoint = "\nYour total CCA Points are ";
    let ccaPoint = 0;

    var connection = new Connection(config);
    connection.on("connect", function (err) {

        let ccaRecords = [];

        if (err) {
            console.log(err);
        }
        else {
            var request = new Request("select Name,Date,Point,Classification from CCARecord WHERE AdminNo ='152287U'", function (err, rowCount, rows) {
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
                                participation += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            case "E":
                                enrichment += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            case "A":
                                achievement += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            case "R":
                                representation += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            case "L":
                                leadership += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            case "S":
                                service += `${decryptedName}(${decryptedDate})\t:\t${decryptedPoint} point\n`;
                                break;
                            default:
                                console.log("CCA found not under any classification");
                        }
                        ccaPoint += parseInt(decryptedPoint);
                    }
                    totalCcaPoint += `*` + ccaPoint + `*`;
                    $.sendMessage(mainText + participation + enrichment + achievement + representation + leadership + service + totalCcaPoint, { parse_mode: 'Markdown' });
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

function ViewMemberList($, key) {
    var connection = new Connection(config);
    connection.on("connect", function (err) {

        let Cca = [];

        if (err) {
            console.log(err);
        }
        else {
            var request = new Request("select CCA from Member WHERE AdminNo ='152287U'", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned');
                    console.log(Cca[0].CCA);
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
    let MemberList = [];
    var connection = new Connection(config);
    connection.on("connect", function (err) {
        var request = new Request(`select Name,Position from Member WHERE CCA ='${Cca[0].CCA}'`, function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' row(s) returned');
                console.log(MemberList);
                for (var item of MemberList) {
                    memberListOuput += `${item["Name"]}\t\t|\t\t${item["Position"]}\n`
                }
                $.sendMessage(memberListOuput, { parse_mode: 'Markdown' }).then(memberListOuput => { MemberListOptions($, key) });
                //MemberListOptions($, key);
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

function MemberListOptions($, key) {
    $.runInlineMenu({
        layout: 3, //some layouting here
        method: 'sendMessage', //here you must pass the method name
        params: ['Any action You would like to take?'], //here you must pass the parameters for that method
        menu: [
            {
                text: 'Add Member',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    addMember($, key)

                }
            },
            {
                text: 'Delete Member',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    ViewMemberList($, key)
                    MemberListOptions($, key);

                }
            },
            {
                text: 'Edit Member',
                callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                    getSelectedSemResult($, connection, semresult, '2', '1', key)

                }
            }
        ]
    })
}

function addMember($, key) {
    const form = {
        addMember: {
            q: 'PLease enter the Admin Number and Position in this format:AdminNO Digits\n\nDigits:\n1 - President\n2 - Vice-President\n3 - Logistics\n4 - Treasurer\n5 - Secretary\n6 - Member',
            error: 'Either your input has restricted charatcers or the admin number is wrong Please Try Again!',
            validator: (message, callback) => {
                var input = message.text.split(' ');
                console.log(input[0])
                if (input[0].length == 7 && input[1].length == 1) {
                    if (validator.isAlphanumeric(input[0])) {
                        var list = [];
                        var connection = new Connection(config);
                        connection.on("connect", function (err) {
                            var request = new Request(`select Name,Email,HP,School,Diploma,CCA from Users WHERE AdminNo ='${input[0]}'`, function (err, rowCount, rows) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(rowCount + ' row(s) returned');
                                    console.log(list);
                                    if (rowCount == 1) {
                                        if (validator.isNumeric(input[1])) {
                                            callback(true, message.text)
                                            return
                                        }
                                    } else {
                                        console.log(message.text)
                                        callback(false)
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
            var request = new Request(`select Name,Email,HP,School,Diploma,CCA from Users WHERE AdminNo ='${addedMember[0]}'`, function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' row(s) returned');
                    console.log(list);
                    if (rowCount == 0) {
                        return false
                    }
                    else {

                        for (var item of list) {
                            name = item["Name"]
                            email = item["Email"]
                            hp = item["HP"]
                            sch = item["School"]
                            dip = item["Diploma"]
                            cca = item["CCA"]
                            result.push(name)
                            result.push(email)
                            result.push(hp)
                            result.push(sch)
                            result.push(dip)
                            result.push(cca)
                            var memberPos = getPosition(addedMember[1])
                            console.log(memberPos)
                            insertDB(memberPos, result, addedMember)
                            doneAdding($);
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

function doneAdding($) {
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
            $.sendMessage('You have finishing adding!')
        }
    })
}   

function insertDB(memberPos,result,addedMember){
    var connection2 = new Connection(config);
    connection2.on("connect", function (err) {
        var request2 = new Request(`INSERT INTO Member (AdminNo,Name,Position,Email,HP,School,Diploma,CCA) VALUES ('${addedMember[0]}', '${result[0]}', '${memberPos}', '${result[1]}','${result[2]}' , '${result[3]}','${result[4]}','${result[5]}');`, function (err) {
            if (err) {
                console.log(err);
            }

            // request2.addParameter("ADMINNO", TYPES.NVarChar, addedMember[0]);
            // request2.addParameter('NAME', TYPES.NVarChar, result[0]);
            // request2.addParameter('POSITION', TYPES.NVarChar, addMember[1]);
            // request2.addParameter('EMAIL', TYPES.NVarChar, result[1]);
            // request2.addParameter('HP', TYPES.NVarChar, result[2]);
            // request2.addParameter('SCHOOL', TYPES.NVarChar, result[3]);
            // request2.addParameter('DIPLOMA', TYPES.NVarChar, result[4]);
            // request2.addParameter('Cca', TYPES.NVarChar, result[5]);

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

