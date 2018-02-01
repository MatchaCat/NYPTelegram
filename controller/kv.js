const consul = require('consul')({promisify: true});
const bluebird = require('bluebird');
const fs = require('fs')

class kvController {

    kvRetrieve(path){
        var jsonObj = consul.kv.get(path)
        
        jsonObj.then((res) => {
            var stringKV = JSON.stringify(res)
            jsonObj = JSON.parse(stringKV)
        })
        return jsonObj
    }

    kvCollection(relativepath){
        var jsonArr = consul.kv.keys(relativepath)
        
        var jsonKeyArr = jsonArr.then((res) => {
            var stringKV = JSON.stringify(res)
            console.log('kvCollection Array --> ' + stringKV)
            var jsonObj = JSON.parse(stringKV)
            console.log('kvCollection Object --> ' + jsonObj)
            var jsonKeyArr = jsonObj.toString().split(',')
            console.log('This is how after separation look like --> ' + jsonKeyArr)
            return jsonKeyArr
        })
        
        jsonKeyArr.then((res) => {
            var jsonValueCollection = []
            for (var i = 0, len = res.length; i < len; i++) {
                jsonValueCollection.push(this.kvRetrieve(res[i]))
                console.log('Individual jsonValueCollection item pushed --> ' + jsonValueCollection[i])
            }
            return jsonValueCollection
        })
        console.log('This is how the end jsonValueCollection look like -->\n\n' + jsonValueCollection)
        return jsonValueCollection
    }
}

module.exports = kvController