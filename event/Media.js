var dotenv = require('dotenv').config();
var ig = require('instagram-node').instagram();
// Every call to `ig.use()` overrides the `client_id/client_secret`
// or `access_token` previously entered if they exist.
ig.use({ client_id: process.env.INSTAGRAM_CLIENT_ID,
         client_secret: process.env.INSTAGRAM_CLIENT_SECRET });
ig.use({ access_token: process.env.INSTAGRAM_ACCESS_TOKEN });

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