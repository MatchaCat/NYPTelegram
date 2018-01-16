'use strict'
//requirements
const Telegram = require('telegram-node-bot')
const Student = require('../model/student')

//initialise object
const TelegramBaseController = Telegram.TelegramBaseController
//const General = new Gencon()

class HelpController extends TelegramBaseController {
    
    help($) {

        const Stud = new Student($)
        console.log('Help condition check: ' + Stud.adminnumber)
        if (Stud.adminnumber == "999999Z" | Stud.adminnumber == null){
            $.sendMessage('\/help - Get help guides... like this one. Like... legit. this.. haha...' + 
                        '\n\/facrev - Step-by-step guide to place NYP facility reservation of choice.' +
                        '\n\/news - NYP news service' +
                        '\n\/feedback - Submit a ticket to i@Central for any enquiries.', 
                        {parse_mode: 'Markdown'}
            )
        }
        else{
            $.sendMessage('\/help - Get help guides... like this one. Like... legit. this.. haha...' + 
                        '\n\/timetable - Your personal fortune teller. (Usually quite depressing)' + //Displays your current semester\'s timetable.*
                        '\n\/gpa - Some things... are better off unseen... but if you still wanna see then ermm..' + //Displays your cumulative GPA to current date.*
                        '\n\/semresult - This one... also better off unseen... but if you still wanna see then ermm..' + //Displays all results to current date.*
                        '\n\/cca - If you\'re the captain, good. If you\'re not... _god_ bless your soul.' + //Displays your total attained CCA points to current date.*
                        '\n\/facrev - Put here also nobody will use one..' + //Step-by-step guide to place NYP facility reservation of choice.
                        '\n\/soa - Not SAO ah dun anyhow. Use this after you sick. Not your medicine.' + //NYP Statement of Absence service*
                        '\n\/media - Ya all the NYP Wassup here and there now come to your phone hoseh alr you signed up one not my daiji horh.' + //NYP news service
                        '\n\/directory - You horny xiao boi boi dun use this find chiobu horh. #hinthint?' + //Student/Staff directory*
                        '\n\/survey - Because your survey-making skills are terrible.' + //One-stop survey channel to get responses from all your NYP friends*
                        '\n\/dsbj - DunSayBoJio ah!' + //broadcasting
                        '\n\/feedback - Ask somemore. Ask somemore. 多一点 la 多一点' + //Submit a ticket to i@Central for any enquiries.
                        '\n _* - Sensitive information, requires password to retrieve info_', 
                        {parse_mode: 'Markdown'}
            )
        }
        
    }

    get routes() {
        return {
            'helpHandler': 'help'
        }
    }
}

module.exports = HelpController