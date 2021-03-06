# Datf2bot

Datf2bot is a Discord bot that can alert you every new TF2 update.

## Adding the bot to your discord server

To add the Datf2bot to your discord server, just follow this link!

https://discordapp.com/oauth2/authorize?client_id=346950445819756545&scope=bot

This will give all permissions to Datf2bot: don't worry, he won't do anything silly like banning every one ! (you can check the source code if you don't believe me :devil:).

However, you can give him custom permissions on your server to make the things safer - just in case - ! To do that, go to the following URL and setup all the permissions yourself, but __make sure Datf2bot still has the right to post messages !!__ If you decided to go with this method, you'll also need the "Client Id", which is:
    
    346950445819756545

https://discordapi.com/permissions.html

## Bot setup

The bot doesn't require any particuliar setup. At the moment you will add him it will print a nice welcome message on your server's default channel, meaning he's been added succefully. If you don't get this message, the bot must be offline. If so, kick him and add him back a few days later, I should've fixed the issue. __Don't add the bot when he's offline!__ otherwise he won't work once he goes back online.

If you want to, you can create a text channel called tf2updates, and the bot will post TF2 updates notifications here instead of your server's default channel.

## Commands

### Alerts (admin only)

    !:alerts

Display whether or not the updates alerts are enabled. If disabled, the server won't get notified if a TF2 update drops. If enabled, Datf2bot will post a message with multiple informations related to the update (date, number of changes, minor or major update, link to the original post on teamfortress.com).

    !:alerts on

Enable updates alerts (enabled by default)

    !:alerts off

Disable updates alerts

### Lang (admin only)

    !:lang

Display which language Datf2bot is set on, in your guild. Please note that this language will only apply with update messages and won't work for small commands, in order to spare the database.

    !:lang LANGUAGE

Where LANGAUGE is a 2 letter country code. Set the language to given value. Currently, supported languages are en and fr.

### Lastupdate (everyone)

    !:lastupdate

Print various stats about last TF2 update and a link to the teamfortress.com original blogpost.

## Troubleshooting

if you experience any difficulty, open an issue by clicking the "issue" tab.

## Warranty

I cannot promise a 100% uptime for Datf2bot, nor I can promise that I will still update and maintain him, but I will try my best to do so. You can, if you want make your own version of Datf2bot. The project is under [MIT liscence](https://en.wikipedia.org/wiki/MIT_License).

## Edit / Run yourself Datf2bot

Clone or download this repository. Edit config.json with your settings. 

> Note: you need a mysql database !

Create a table called "datf2bot" with the following columns:

|  name  |primary| A.I |  type  |
|:------:|:-----:|:---:|:------:|
|id      |yes    |yes  |int     |
|guild_id|no     |no   |char(18)|
|alerts  |no     |no   |boolean |
|lang    |no     |no   |char(2) |


Make sure you have at least nodejs 6 and npm installed.
Run `npm install` in the main directory to install all dependencies.
Then, start the bot with `node datf2bot.js` .

If you're planning to run the bot 24/7, I recommand using [pm2](https://github.com/Unitech/pm2).

    npm install pm2 -g
    
You can now start the bot using pm2. It will continue running even if your ssh session ends and it will restart the bot if it stops for some reason.

    pm2 start datf2bot.js
    
## How does it work

There isn't a TF2 API or such things (Well there is a RSS flux for the news but it's broken lul). So Datf2bot uses an HTML parser to get data from teamfortress.com, every 10s.

## Help me !

Any pull requests are welcome, especially for a better translation !
Translation files can be found in the lang directory.
Copy paste template.json to make a translation of your language, or improve one already existing by editing it.
When you're done, submit a pull request.
