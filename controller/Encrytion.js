// var randomstring = require("randomstring");
// var randomisedString = randomstring.generate();
// console.log(randomisedString)

var aes256 = require('aes256');

// var key = randomisedString;
// var plaintext = '152287U';

// var encrypted = aes256.encrypt(key, plaintext);
// console.log(encrypted);

// var decrypted = aes256.decrypt(key, encrypted);
// console.log(decrypted);



var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://152287U:TelegramBot12345@nyp-telegram-shard-00-00-kqhli.mongodb.net:27017,nyp-telegram-shard-00-01-kqhli.mongodb.net:27017,nyp-telegram-shard-00-02-kqhli.mongodb.net:27017/NYP-Telegram?ssl=true&replicaSet=NYP-Telegram-shard-0&authSource=admin";

var key = "h4Xz8MVGimfSvG7vkCfushbx7O67Xazw";


var Connection = require('tedious').Connection; 
var Request = require('tedious').Request; 
var TYPES = require('tedious').TYPES;
var config = { 
    userName: "Telegram", 
    password: "Bot12345", 
    server: "nyp-telegram.database.windows.net", 
    options: { 
        database: "NYP_TELEGRAM", 
        encrypt: true, 
    } 
}; 

// MongoClient.connect(url, function(err, client) {
//     if (err) throw err;
//     var db = client.db('NYP-Telegram');
//     var query = { AdminNo: "152287U" };
//     db.collection("Key").find(query).toArray(function(err, result) { 
//       if (err) throw err;
//       console.log(result[0].Key);
//       key = result[0].Key;

//       client.close();
//     });
// });

// var connection = new Connection(config); 
// connection.on("connect",function(err){ 
//     var semresult =[];
//     if (err) 
//         console.log(err);
//     var request = new Request("select AdminNo,Subject,Sem,Year,Type,Credits,Grade,GradePoint from Subject WHERE AdminNo ='152287U'",  function(err, rowCount, rows) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(rowCount + ' row(s) returned');
//             console.log(semresult);
//             for(var item of semresult) {
//                 //var encryptedAdmin = aes256.encrypt(key, item["AdminNo"]);
//                 var encryptedSub = aes256.encrypt(key, item["Subject"]);
//                 //var encryptedSem = aes256.encrypt(key, item["Sem"].toString());
//                 //var encryptedYear = aes256.encrypt(key, item["Year"].toString());
//                 var encryptedType = aes256.encrypt(key, item["Type"]);
//                 var encryptedCredit = aes256.encrypt(key, item["Credits"].toString());
//                 var encryptedGrade = aes256.encrypt(key, item["Grade"]);
//                 if(item["Type"] == 'CM'){
//                     var encryptedGP = aes256.encrypt(key, item["GradePoint"]);
//                 }
//                 addToDB(encryptedSub,item["Sem"],item["Year"],encryptedType,encryptedCredit,encryptedGrade,encryptedGP);
//             } 
//         }
//     });
//         request.on('row', function(columns) {
//             var row = {};
//             columns.forEach(function(column) {
//                 row[column.metadata.colName] = column.value;
//             });
//             semresult.push(row);

//         });
            
    
//     connection.execSql(request);

//  });

//  function addToDB(encryptedSub,Sem,Year,encryptedType,encryptedCredit,encryptedGrade,encryptedGP){
//     var connection = new Connection(config); 
//     connection.on("connect",function(err){ 
//         var request = new Request(`INSERT Subjects (AdminNo,Subject,Sem,Year,Type,Credits,Grade,GradePoint) VALUES ('152287U', '${encryptedSub}', '${Sem}', '${Year}','${encryptedType}','${encryptedCredit}','${encryptedGrade}','${encryptedGP}');`,  function(err, rowCount, rows) {
//             if (err) {  
//                 console.log(err);}  
//             });  
//             request.on('row', function(columns) {  
//                 columns.forEach(function(column) {  
//                   if (column.value === null) {  
//                     console.log('NULL');  
//                   } else {  
//                     console.log("inserted item is " + column.value);  
//                   }  
//                 });  
//             });       
//             connection.execSql(request);
//         });
// }

var connection = new Connection(config); 
connection.on("connect",function(err){ 
    var semresult =[];
    if (err) 
        console.log(err);
    var request = new Request("select Name,Date,Point,Classification from CCA WHERE AdminNo ='152287U'",  function(err, rowCount, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' row(s) returned');
            console.log(semresult);
            for(var item of semresult) {
                var encryptedName = aes256.encrypt(key, item["Name"]);
                var encryptedDate = aes256.encrypt(key, item["Date"]);
                var encryptedPoint = aes256.encrypt(key, item["Point"].toString());
                var encryptedClass = aes256.encrypt(key, item["Classification"]);
                addToDBCCA(encryptedName,encryptedDate,encryptedPoint,encryptedClass);
            } 
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

 });

 function addToDBCCA(encryptedName,encryptedDate,encryptedPoint,encryptedClass){
    var connection = new Connection(config); 
    connection.on("connect",function(err){ 
        var request = new Request(`INSERT CCARecord (AdminNo,Name,Date,Point,Classification) VALUES ('152287U', '${encryptedName}', '${encryptedDate}', '${encryptedPoint}','${encryptedClass}');`,  function(err, rowCount, rows) {
            if (err) {  
                console.log(err);}  
            });  

            request.on('row', function(columns) {  
                columns.forEach(function(column) {  
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