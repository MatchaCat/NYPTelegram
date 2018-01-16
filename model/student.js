'use strict'

const Nyp = require('./abs/nyp')
const Telegram = require('telegram-node-bot')

const BaseScopeExtension = Telegram.BaseScopeExtension

var userCount = 0

class Student extends Nyp {
    
    static blankmethod() {
      // Implementation of abstract static method.
      console.log('Student.blankmethod');
    }
    constructor($) {
      super();
      this.adminnumber = this.retrieve($)
      userCount++
      // Implementation of constructor.

    }
    blankmethod() {
      // Implementation of abstract method.
      console.log('Student.prototype.blankmethod');
    }

    retrieve($){
        //connect to sql
        //get telegram id from $
        //search with telegram id, retrieve other info
        //create student object
        //if nothing retrieved, do something
        var an = "999999Z"
        return an
    }
}


module.exports = Student