# Datf2bot

Datf2bot is a Discord bot that can alert you every new TF2 update.

## Adding the bot to your discord server

To add the Datf2bot to your discord server, just follow this link!

https://discordapp.com/oauth2/authorize?client_id=346950445819756545&scope=bot

This will give all permissions to Datf2bot: don't worry, he won't do anything silly like banning every one ! (you can check the source code if you don't believe me :devil:).

However, you can give him custom permissions on your server to make the things safer - just in case - ! To do that, go to the following URL and setup all the permissions yourself, but __make sure Datf2bot still has the right to post messages !!__ If you decided to go with this method, you'll need too the "Client Id"; which is:
    
    346950445819756545

https://discordapi.com/permissions.html#268435465

## Bot setup

The bot doesn't require any particuliar setup. At the moment you will add him it will print a nice welcome message on your server's default channel, meaning he's been added succefully. If you don't get this message, the bot must be offline. If so, kick him and add him back a few days later, I should've fixed the issue. __Don't add the bot when he's offline!__ otherwise he won't work once he goes back online.

If you want to, you can create a text channel called tf2updates, and the bot will post TF2 updates notifications here instead of your server's default channel.

## Commands

### Alerts (admin only)


    !:alerts

Display whether or not the updates alerts are enabled. If disabled, the server won't get notified if a TF2 update drops. If enabled, Datf2bot will post a message with multiple informations related to the update (date, number of changes, minor or major update, link to the original post on teamfortress.com)

    !:alerts on

Enable updates alerts (enabled by default)

    !:alerts off
Disable updates alerts

## Warranty

I cannot promise a 100% uptime for Datf2bot, nor I can promise that I will still update and maintain him, but I will try my best to do so. You can, if you want make your own version of Datf2bot. The project is under [MIT liscence](https://en.wikipedia.org/wiki/MIT_License).

## Edit / Run yourself Datf2bot

Clone or download this repository. Edit config.json with your settings. 

> Note: you need a mysql database !

Make sure you have at least nodejs 6 and npm installed.
Then, run the bot with ```node datf2bot.js``` .
Dependencies will be of course automatically installed.

## How does it works

There isn't a TF2 API or such things (Well there is a RSS flux for the news but it's broken lul). So Datf2bot uses an HTML parser to get data from teamfortress.com, every 10s.

## Help me !

Any pull requests are welcome, especially for a better translation !