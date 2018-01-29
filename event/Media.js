const RapidAPI = require('rapidapi-connect');
const rapid = new RapidAPI("default-application_5a58af79e4b0647066e63809", "fb32af62-a39d-436f-bd6a-5fe4443df27e");

var ig = require('instagram-node').instagram();

// Every call to `ig.use()` overrides the `client_id/client_secret`
// or `access_token` previously entered if they exist.
ig.use({ client_id: '72548f464d4541389ed80add9518c9c0',
         client_secret: 'a4bf76c35f0e420584152fcbfe9c9100' });
ig.use({ access_token: '6910884488.72548f4.e503afc67ae04aa7885aff0ac4be04ed' });

'use strict';

const Telegram = require('telegram-node-bot');

class MediaController extends Telegram.TelegramBaseController {
    viewLatestInstagramPostCommandHandler($) {

        ig.user_media_recent('6910884488', function(err, medias, pagination, remaining, limit) {
            
            if (err)
                console.log(err)
            else
                console.log(medias[0].images.standard_resolution.url);
                $.sendMessage(medias[0].link)
                
        });
 
    }
    get routes() {
        return {
            'viewLatestInstagramPostCommand': 'viewLatestInstagramPostCommandHandler'
        };
    }
}

module.exports = MediaController;