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

    kvSet(key, value, callback){
        var session = ""
        var phaseOne = consul.session.create()
        var phaseTwo = phaseOne.then((result) =>{
            var sSession = JSON.stringify(result)
            session = JSON.parse(sSession)
            return
        }, (err) =>{console.log('KV session creation error --> ' + err)})
        var phaseThree = phaseTwo.then((res) =>{
            return consul.kv.set(key, value, {acquire: session.ID})
        }, (err) =>{console.log('Unable to set key:value properly --> ' + err)})
        var phaseFour = phaseThree.then((res) =>{
            return consul.kv.set(key, value, {release: session.ID})
        }, (err) =>{console.log('Release error: --> ' + err)})
        // var phaseFive = phaseFour.then((res) =>{
        //     return consul.session.destroy(session.ID)
        // }, (err) =>{console.log('Session don\'t want to let go: --> ' + err)})
        var phaseFive= phaseFour.then((res) =>{
            if (res){
                console.log("KV PUT SUCCESS ----------------")
                callback(true)
            }
        })
    }
}

module.exports = kvController