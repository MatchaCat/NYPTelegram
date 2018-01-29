'use strict';

const Telegram = require('telegram-node-bot');
var Connection = require('tedious').Connection; 
var Request = require('tedious').Request; 

var aes256 = require('aes256');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://152287U:TelegramBot12345@nyp-telegram-shard-00-00-kqhli.mongodb.net:27017,nyp-telegram-shard-00-01-kqhli.mongodb.net:27017,nyp-telegram-shard-00-02-kqhli.mongodb.net:27017/NYP-Telegram?ssl=true&replicaSet=NYP-Telegram-shard-0&authSource=admin";

var config = { 
    userName: "Telegram", 
    password: "Bot12345", 
    server: "nyp-telegram.database.windows.net", 
    options: { 
        database: "NYP_TELEGRAM", 
        encrypt: true, 
    } 
}; 

class ResultController extends Telegram.TelegramBaseController {

    viewAllSemResultCommandHandler($) {
        var key="";
        MongoClient.connect(url, function(err, client) {
            if (err) throw err;
            var db = client.db('NYP-Telegram');
            var query = { AdminNo: "152287U" };
            db.collection("Key").find(query).toArray(function(err, result) { 
              if (err) throw err;
              console.log(result[0].Key);
              key = result[0].Key;
              client.close();
            });
        });
        var connection = new Connection(config); 
        connection.on("connect",function(err){ 
        let semresult =[];
        if (err){
            console.log(err);
        }
        else
        {
            $.runInlineMenu({
                layout: 2, //some layouting here
                method: 'sendMessage', //here you must pass the method name
                params: ['Select the Semester!!'], //here you must pass the parameters for that method
                menu: [
                    {
                        text: 'Year 1 Sem 1',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'1','1',key)

                        }
                    },
                    {
                        text: 'Year 1 Sem 2',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'1','2',key)

                        }
                    },
                    {
                        text: 'Year 2 Sem 1',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'2','1',key)

                        }
                    },
                    {
                        text: 'Year 2 Sem 2',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'2','2',key)

                        }
                    },
                    {
                        text: 'Year 3 Sem 1',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'3','1',key)

                        }
                    },
                    {
                        text: 'Year 3 Sem 2',
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getSelectedSemResult($,connection,semresult,'3','2',key)

                        }
                    },                    {
                        text: 'All Semester', //text of the button
                        callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                            getAllSem($,connection,semresult,key);
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
            'viewAllSemResultCommand': 'viewAllSemResultCommandHandler',
            //'viewsemresult :num1 :num2': 'viewSelectedSemResultHandler'
        };
    }

    

}

module.exports = ResultController;
//module.exports = SumScopeExtension;


function getAllSem($,connection,semresult,key){
    let mainText = '*Your Results for all Sememsters:*';
    let year1Sem1 = '\n\n*Year 1 Sem 1:*\n';
    let year1Sem2 = '\n\n*Year 1 Sem 2:*\n';
    let year2Sem1 = '\n\n*Year 2 Sem 1:*\n';
    let year2Sem2 = '\n\n*Year 2 Sem 2:*\n';
    let year3Sem1 = '\n\n*Year 3 Sem 1:*\n';
    let year3Sem2 = '\n\n*Year 3 Sem 2:*\n';
    let accumulatedGpa = '\n Your Accumlated GPA is '
    var totalCreditMulPoint = 0;
    var totalModuleCredit = 0;
    var request = new Request("select Subject,Sem,Year,Type,Credits,Grade,GradePoint from Subjects WHERE AdminNo ='152287U'",  function(err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' row(s) returned');
            //console.log(semresult);
            for(var item of semresult) {
                var decryptedSub = aes256.decrypt(key, item["Subject"]);
                var decryptedType = aes256.decrypt(key, item["Type"]);
                var decryptedCredit = aes256.decrypt(key, item["Credits"]);
                var decryptedGrade = aes256.decrypt(key, item["Grade"]);
                var decryptedGradePoint = aes256.decrypt(key, item["GradePoint"]);
                var x = item["Year"] + ''+ item["Sem"];
                //console.log(x);
                switch (x) {
                    case "11":
                        year1Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "12":
                        year1Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "21":
                        year2Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "22":
                        year2Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "31":
                        year3Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "32":
                        year3Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    default:
                        console.log("No year or sem is similar as stated in DB");
                }
                if (decryptedType == "CM"){
                    console.log(parseInt(decryptedCredit)+'credit')
                    console.log(parseInt(decryptedGradePoint)+'gp')
                    totalCreditMulPoint+= (parseInt(decryptedCredit)*parseFloat(decryptedGradePoint));
                    totalModuleCredit+= parseInt(decryptedCredit);
                }
            }
            console.log(totalCreditMulPoint+' MULPOINT')
            console.log(totalModuleCredit+' module credit')
            accumulatedGpa+= `*`+(totalCreditMulPoint/totalModuleCredit).toFixed(2)+`*`;
            $.sendMessage(mainText +  year1Sem1 +  year1Sem2 +  year2Sem1 +  year2Sem2 +  year3Sem1 +  year3Sem2 + accumulatedGpa, { parse_mode: 'Markdown' });
        }
    }); 
         
        request.on('row', function(columns) {
            var row = {};
            columns.forEach(function(column) {
                row[column.metadata.colName] = column.value;
            });
            semresult.push(row);

            });
        connection.execSql(request);
}

function getSelectedSemResult($,connection,semresult,year,sem,key){
    let year1Sem1 = '';
    let year1Sem2 = '';
    let year2Sem1 = '';
    let year2Sem2 = '';
    let year3Sem1 = '';
    let year3Sem2 = '';
    let accumulatedGpa = '\n Your chosen semester\'s GPA is '
    var totalCreditMulPoint = 0;
    var totalModuleCredit = 0;
    var request = new Request(`select Subject,Sem,Year,Type,Credits,Grade,GradePoint from Subjects WHERE AdminNo ='152287U' and Sem = ${sem} and Year = ${year}`,  function(err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' row(s) returned');
            console.log(semresult);
            for(var item of semresult) {
                var decryptedSub = aes256.decrypt(key, item["Subject"]);
                var decryptedType = aes256.decrypt(key, item["Type"]);
                var decryptedCredit = aes256.decrypt(key, item["Credits"]);
                var decryptedGrade = aes256.decrypt(key, item["Grade"]);
                var decryptedGradePoint = aes256.decrypt(key, item["GradePoint"]);
                var x = item["Year"] + ''+ item["Sem"];
                console.log(x);
                switch (x) {
                    case "11":
                        year1Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "12":
                        year1Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "21":
                        year2Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "22":
                        year2Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "31":
                        year3Sem1+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    case "32":
                        year3Sem2+=  `${decryptedSub} - *${decryptedGrade}*\n`;
                        break;
                    default:
                        console.log("No year or sem is similar as stated in DB");
                }
                if (decryptedType == "CM"){
                    totalCreditMulPoint+= (parseInt(decryptedCredit)*parseFloat(decryptedGradePoint));
                    totalModuleCredit+= parseInt(decryptedCredit);
                }
            }
            console.log(totalCreditMulPoint)
            console.log(totalModuleCredit)
            accumulatedGpa+= `*`+(totalCreditMulPoint/totalModuleCredit).toFixed(2)+`*`;
            $.sendMessage(`\n\n*Year `+ item["Year"] + ` Sem `+ item["Sem"] +`*:\n` + year1Sem1 +  year1Sem2 +  year2Sem1 +  year2Sem2 +  year3Sem1 +  year3Sem2 + accumulatedGpa, { parse_mode: 'Markdown' });
        }
    }); 
         
        request.on('row', function(columns) {
            var row = {};
            columns.forEach(function(column) {
                row[column.metadata.colName] = column.value;
            });
            semresult.push(row);

            });
        connection.execSql(request);
}