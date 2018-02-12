'use strict'

const Database = require('../controller/db')
const Telegram = require('telegram-node-bot')
var bluebird = require('bluebird');
var Connection = require('tedious').Connection

const BaseScopeExtension = Telegram.BaseScopeExtension
var dbCall = new Database()

class Student{

    retrieve($, callback){
        // Attempt to connect and execute queries if connection goes through
        var connection = dbCall.getConfig().then((res) => {
            return new Connection(res)
        })
        
        var querylaunch = connection.then((connection) =>{
            connection.on('connect', function(err){
                if (err) 
                {
                    console.log("Something wrong here? ---> " + err)
                }
                else
                {
                    //eventually you will need to use the param 'tgid' to get data from table 'Users', column 'TGID'
                    console.log("Starting this query...")
                    var queryPush = dbCall.queryDatabase(connection, 'Users', 'TGID', $.message.from.id, function(res){
                        if (res !== undefined){
                            var studParticulars = res.split("/")
                            console.log("studParticulars in retrieve() = " + JSON.stringify(studParticulars))
                            callback([$, {
                                id: studParticulars[0],
                                adminnumber: studParticulars[1],
                                acct_type: studParticulars[2],
                                name: studParticulars[3],
                                email: studParticulars[4],
                                password: studParticulars[5],
                                school: studParticulars[6],
                                diploma: studParticulars[7],
                                year: studParticulars[8],
                                semester: studParticulars[9],
                                cca: studParticulars[10],
                                subjects: studParticulars[11]
                            }])
                        }
                        //if nothing retrieved, return a fresh user
                        else{
                            console.log("ELSE on SPL: " + res)
                            callback([$, {
                                id: null,
                                adminnumber: null,
                                acct_type: null,
                                name: null,
                                email: null,
                                password: null,
                                school: null,
                                diploma: null,
                                year: null,
                                semester: null,
                                cca: null,
                                subjects: null
                            }])
                        }
                    })
                }
            })
        })
    }
}

module.exports = Student