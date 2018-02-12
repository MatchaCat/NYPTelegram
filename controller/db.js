var Connection = require('tedious').Connection
var Request = require('tedious').Request
var kvController = require('../controller/kv')
var bluebird = require('bluebird');

var kv = new kvController()

class Database {

  getConfig(){
    
    // Create connection to database
    var configList = kv.kvRetrieve(process.env.AZURE_CONNECTION)
    var configReq = configList.then((res) => {
      console.log(res.Value.split("/"))
      return res.Value.split("/")
    })

    var config = configReq.then((configReq) => {
      return {
        userName: configReq[0],
        password: configReq[1],
        server: configReq[2],
        options: 
            {
              database: configReq[3],
              encrypt: true
            }
      }
    })
    return config
  }

  async queryDatabase(connection, table, keyword, condition, callback){
    console.log('Reading row(s) from the Table...')
    
    let queriedObjectinString = ""
    // Read all rows from table
    var querystring = "SELECT * FROM " + table + " WHERE " + keyword + "='" + condition + "'"

    var request = new Request(querystring, function(err){
        console.log(queriedObjectinString.slice(0, -1))
        callback(queriedObjectinString.slice(0, -1))
    })

    request.on('row', function(columns) {
          columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value)
            queriedObjectinString += column.value + "/"
          })
        })
    connection.execSql(request)
  }

  alterDatabaseinC(connection, table, values){
    console.log('Writing entries into the Table...')
    
    let queryExecutionCheck = false

    console.log( "Values: --> " + values.toString());

    // Write rows into table
    var querystring = "INSERT INTO " + table + " VALUES (" + values.toString()  + ")"

    var request = new Request(
      querystring,
      function(err, rowCount, rows) 
        {
          queryExecutionCheck = true

          console.log(rowCount + ' row(s) affected.')
        })
    connection.execSql(request)
    return queryExecutionCheck
  }

  alterDatabaseinU(connection, table, column, value, keyword, condition){
    console.log('Updating entries in the Table...')
    // cvConcar puts matching elements of column array and value array together

    let queryExecutionCheck = false
    // Edit rows in table
    var querystring = "UPDATE " + table + " SET " + cvConcar + " WHERE " + keyword + "='" + condition + "'"

    var request = new Request(
      querystring,
      function(err, rowCount, rows) 
        {
          queryExecutionCheck = true

          console.log(rowCount + ' row(s) deleted.')
        })
    connection.execSql(request)
    return queryExecutionCheck
  }

  alterDatabaseinD(connection, table, keyword, condition){
    console.log('Deleting entries from the Table...')
    
    let queryExecutionCheck = false
    // Remove rows from table
    var querystring = "DELETE FROM " + table + " WHERE " + keyword + "='" + condition + "'"

    var request = new Request(
      querystring,
      function(err, rowCount, rows) 
        {
          queryExecutionCheck = true

          console.log(rowCount + ' row(s) deleted.')
        })
    connection.execSql(request)
    return queryExecutionCheck
  }
}

module.exports = Database