var updates = require('./updatechecker').updates;

// db-related settings must be put in this json file
const config = require('./config.json');

const fs = require('fs');
const mysql = require('mysql');

var db = mysql.createPool({
	host: config.mysql.host,
	user: config.mysql.user,
	database: config.mysql.database,
	password: config.mysql.password,
	port: config.mysql.port ? config.mysql.port : 3306
});

const translations = {
	'fr': require('./lang/fr.json'),
	'en': require('./lang/en.json')
};

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.token);

client.on('ready', () => {
	client.user.setGame(`${config.prefix}help`);
});

client.on('message',  msg => {
	// don't answer to bots
	if(msg.author.bot) return;
	// ignore regular messages
	if(msg.content.indexOf(config.prefix) !== 0) return;

	const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if(command == 'alerts') {
		if(!msg.member.hasPermission('ADMINISTRATOR')) {
			msg.reply('You do not have access to this command');
			return;
		}
		
		if(args.length !== 0) {

			// enable alerts
			if(args[0] == 'on') {
				// get a connection from the pool
				db.getConnection( (coerr, connection) => {
					if(coerr) {
						msg.channel.send('An error has occured, try again later.');
						console.log(coerr);
						return;
					}
					// query the db
					let sql = 'UPDATE datf2bot SET alerts = true WHERE guild_id = ?';
					connection.query(sql, [msg.guild.id], reqerr => {
						connection.release();							
						if(reqerr) {
							msg.channel.send('An error has occured, try again later.');
							console.log(reqerr);
							return;
						}
						msg.channel.send('Enabled TF2 updates alerts');
		
					});
				});
			
			// disable alerts
			} else if(args[0] == 'off') {
				db.getConnection( (coerr, connection) => {
					if(coerr) {
						msg.channel.send('An error has occured, try again later.');
						console.log(coerr);
						return;
					}
					let sql = 'UPDATE datf2bot SET alerts = false WHERE guild_id = ?';
					connection.query(sql, [msg.guild.id], reqerr => {
						connection.release();
						if(reqerr) {
							msg.channel.send('An error has occured, try again later.');
							console.log(reqerr);
							return;
						}
						msg.channel.send('Disabled TF2 updates alerts');				
					});
				});
			
			// syntax error
			} else {
				msg.channel.send(`Syntax: ${config.prefix}alerts [on|off]`);
			}

		// get current alerts status
		} else {
			db.getConnection( (coerr, connection) => {
				if(coerr) {
					msg.channel.send('An error has occured, try again later.');
					console.log(coerr);
					return;
				}
				let sql = 'SELECT alerts FROM datf2bot WHERE guild_id = ?';
				connection.query(sql, [msg.guild.id], (reqerr, res) => {
					connection.release();
					if(reqerr) {
						msg.channel.send('An error has occured, try again later.');
						console.log(reqerr);
						return;
					}
					msg.channel.send('TF2 updates alerts are ' + (res[0].alerts ? 'on' : 'off'));
				});
			});
		}

	} else if(command == 'lastupdate') {
		fs.readFile('lastupdate.json', (err, data) => {
			if(err) {
				console.log(err);
				msg.channel.send('An error has occured, try again later.');
				return;
			}

			db.getConnection( (coerr, connection) => {
				if(coerr) {
					msg.channel.send('An error has occured, try again later.');
					console.log(coerr);
					return;
				}

				let sql = 'SELECT lang FROM datf2bot WHERE guild_id = ?'
				db.query(sql, [msg.guild.id], (reqerr, res) => {
					connection.release();

					if(reqerr) {
						msg.channel.send('An error has occured, try again later.')
						console.log(reqerr);
						return;
					}

					// convert data into an object
					data = JSON.parse(data);
					
					let guildlang = res[0].lang;

					// date translating
					let translatedDate = `${data.date.day} ${translations[guildlang].monthes[translations.en.monthes.indexOf(data.date.month)]} ${data.date.year}.`;
					
					// final translated string
					var translatedUpdate = 
					   `${translations[guildlang].lastupdate} ${translatedDate}`
						+ `\n${(data.majorupdate ? translations[guildlang].majorupdate : translations[guildlang].minorupdate)} (${data.changes} ${(data.changes > 1 ? translations[guildlang].changes : translations[guildlang].change)})`
						+ `\nhttp://teamfortress.com/post.php?id=${data.id}`;

					msg.channel.send(translatedUpdate);

				});
			});
		});

	} else if(command == 'lang') {

		if(!msg.member.hasPermission('ADMINISTRATOR')) {
			msg.reply('You do not have access to this command');
			return;
		}

		if(args.length !== 0) {
			if(translations[args[0].toLowerCase()]) {
				// translation is available, register the new guild language in the database
				db.getConnection( (coerr, connection) => {
					if(coerr) {
						msg.channel.send('An error has occured, try again later.');
						console.log(coerr);
						return;
					}

					let sql = 'UPDATE datf2bot SET lang = ? WHERE guild_id = ?';
					connection.query(sql, [args[0].toLowerCase(), msg.guild.id], reqerr => {
						connection.release();
						if(reqerr) {
							msg.channel.send('An error has occured, try again later.')
							console.log(reqerr);
							return;
						}
						
						// language succefully changed
						msg.channel.send('Your language has been changed (only applies to update messages)');
					});
				});
			} else {
				msg.channel.send(`This language isn't supported. Available languages: ${Object.keys(translations).join(', ')}.`);
			}
		} else {
			// display the current language
			db.getConnection( (coerr, connection) => {
				if(coerr) {
					msg.channel.send('An error has occured, try again later.');
					console.log(reqerr);
					return;
				}

				let sql = 'SELECT lang FROM datf2bot WHERE guild_id = ?'; 
				db.query(sql, [msg.guild.id], (reqerr, res) => {
					connection.release();
					if(reqerr) {
						msg.channel.send('An error has occured, try again later.');
						console.log(reqerr);
						return;
					}

					msg.channel.send(`Current language: ${res[0].lang}`);
				});
			});
		}
	} else if(command == 'help') {
		if(args.length == 0) {
			msg.channel.send(
				`List of commands:\n\n`
				+ `${config.prefix}alerts (admin only)\n`
				+ `${config.prefix}lang (admin only)\n`
				+ `${config.prefix}lastupdate (everyone)\n`
				+ `\nFor further help, use ${config.prefix}help COMMAND_NAME`		
			);
		} else {
			if(args[0] == 'alerts') {
				// doc to write here but im way too lazy
			}
		}
	}
});

// on guild enter
client.on('guildCreate', guild => {
	// defaultchannel "hack"
	var defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
	// send a welcome message
	defaultChannel.send(`Hi ! I\'m your new TF2 Bot !\nI can notify the whole server every time an update drops.\nUse ${config.prefix}help for help !`);
	
	// add the guild to the database
	db.getConnection( (coerr, connection) => {
		if(coerr) {
			msg.channel.send('An error has occured, try again later.');
			console.log(coerr);
			return;
		}
		let sql = 'INSERT INTO datf2bot (guild_id, alerts, lang) VALUES (?, true, "en")';
		connection.query(sql, [guild.id], reqerr => {
			connection.release();
			if(reqerr) {
				defaultChannel.send('Fatal error while trying to add your discord server to the database !');
				console.log(reqerr);
				return;
			}
		});
	});
});

// on guild kick
client.on('guildDelete', guild => {
	// remove guild from db
	db.getConnection( (coerr, connection) => {
		if(coerr) {
			console.log(coerr);
			return;
		}
		let sql = 'DELETE FROM datf2bot WHERE guild_id = ?';
		connection.query(sql, [guild.id], (reqerr) => {
			connection.release();
			if(reqerr) {
				console.log(reqerr);
				return;
			}
		});
	});
});

//
updates.on('new', update => {
	let sql = 'SELECT guild_id, lang FROM datf2bot WHERE alerts = true';
	db.getConnection( (coerr, connection) => {
		if(coerr) {
			console.log(coerr);
			return;
		}
		connection.query(sql, (reqerr, res) => {
			connection.release();
			if(reqerr) {
				console.log(reqerr);
				return;
			}
			
			var translatedUpdate = {};

			for(let i=0;i<res.length;i++) {
				// get the guild
				let guild = client.guilds.get(res[i].guild_id);
				
				// if the translation for this message hasn't been done yet, do it (for performance purposes, don't translate at each iteration)

				let guildlang = res[i].lang;

				if(!translatedUpdate[guildlang]) {
					
					// date translating
					let translatedDate = `${update.date.day} ${translations[guildlang].monthes[translations.en.monthes.indexOf(update.date.month)]} ${update.date.year}`;

					// final translated string
					translatedUpdate[guildlang] =
						`${translations[guildlang].newupdate}`
						+ `\n${translatedDate}`
						+ `\n${(update.majorupdate ? translations[guildlang].majorupdate : translations[guildlang].minorupdate)} (${update.changes} ${(update.changes > 1 ? translations[guildlang].changes : translations[guildlang].change)})`
						+ `\nhttp://teamfortress.com/post.php?id=${update.id}`;
				}

				// search for the tf2updates channel
				let updateChannel = guild.channels.find('name', 'tf2updates');
				if(updateChannel) {
					updateChannel.send(translatedUpdate[guildlang]);
				} else { // fallback to default channel
					let defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
					defaultChannel.send(translatedUpdate[guildlang]);
				}
			}
		});
	});
});
