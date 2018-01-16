var Connection = require('tedious').Connection
var Request = require('tedious').Request
var KeyVault = require('azure-keyvault')
var AuthenticationContext = require('adal-node').AuthenticationContext
 
var clientId = "<to-be-filled>"
var clientSecret = "<to-be-filled>"
var vaultUri = "<to-be-filled>"
 
// Authenticator - retrieves the access token 
var authenticator = function (challenge, callback) {
 
  // Create a new authentication context. 
  var context = new AuthenticationContext(challenge.authorization);
  
  // Use the context to acquire an authentication token. 
  return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
    if (err) throw err;
    // Calculate the value to be set in the request's Authorization header and resume the call. 
    var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
 
    return callback(null, authorizationValue);
  });
 
};

// Create connection to database
var config = 
   {
     userName: 'someuser', // update me
     password: 'somepassword', // update me
     server: 'edmacasqlserver.database.windows.net', // update me
     options: 
        {
           database: 'somedb' //update me
           , encrypt: true
        }
   }
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) 
   {
     if (err) 
       {
          console.log(err)
       }
    else
       {
           queryDatabase()
       }
   }
 );

function queryDatabase()
   { console.log('Reading rows from the Table...');

       // Read all rows from table
     request = new Request(
          "SELECT TOP 20 pc.Name as CategoryName, p.name as ProductName FROM [SalesLT].[ProductCategory] pc JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid",
             function(err, rowCount, rows) 
                {
                    console.log(rowCount + ' row(s) returned');
                    process.exit();
                }
            );

     request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
         });
             });
     connection.execSql(request);
   }