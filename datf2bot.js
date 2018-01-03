// clear screen
console.log('\033[2J');

// write the splash screen (a little bit edgy, isn't it ?)
console.log('██████╗  █████╗ ████████╗███████╗██████╗ ██████╗  ██████╗ ████████╗');
console.log('██╔══██╗██╔══██╗╚══██╔══╝██╔════╝╚════██╗██╔══██╗██╔═══██╗╚══██╔══╝');
console.log('██║  ██║███████║   ██║   █████╗   █████╔╝██████╔╝██║   ██║   ██║   ');
console.log('██║  ██║██╔══██║   ██║   ██╔══╝  ██╔═══╝ ██╔══██╗██║   ██║   ██║   ');
console.log('██████╔╝██║  ██║   ██║   ██║     ███████╗██████╔╝╚██████╔╝   ██║   ');
console.log('╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═════╝  ╚═════╝    ╚═╝   ');
console.log('___________________________________________________________________');
console.log('\r\n');
console.log('\x1b[0m', 'Loading dependencies ...');

const fs = require('fs');
const mysql = require('mysql');

// update checker script
var updates = require('./updatechecker').updates;

// error handling of client-side commands
const errors = require('./errors');

// db-related settings must be put in this json file
const config = require('./config.json');

console.log('\x1b[32m', 'DONE');

// database connection
var db = mysql.createPool({
	host: config.mysql.host,
	user: config.mysql.user,
	database: config.mysql.database,
	password: config.mysql.password,
	port: config.mysql.port ? config.mysql.port : 3306
});

console.log('\x1b[0m', 'Fetching translation files ...');
// iterate over all translation files to get the available languages
var translations = {};

fs.readdirSync('./lang/').forEach(file => {

	// ignore the template
	if (file != 'template.json') {

		// remove the .json extension to get the language name
		let langName = file.slice(0, -5)

		translations[langName] = require(`./lang/${file}`);
	}
});

console.log('\x1b[32m', `DONE (${Object.keys(translations).length} languages)`);

console.log('\x1b[0m', 'Starting Discord API ...');
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.token).then(() => {
	console.log('\x1b[32m', 'DONE');
	testConnection();
}).catch(() => {
	console.log('\x1b[31m', 'ERROR');
	// reset terminal color
	console.log('\x1b[32m', '');
	process.exit();
});

function testConnection() {
	console.log('\x1b[0m', 'Connecting to database ...');

	// try a test connection to the database
	db.getConnection((coerr, connection) => {
		if (coerr || connection.state === 'disconnected') {
			console.log('\x1b[31m', 'ERROR');
			// reset terminal color
			console.log('\x1b[32m', '');
			process.exit();
		} else {
			console.log('\x1b[32m', 'DONE');
			console.log('\x1b[0m', '\r\nDatf2bot is ready-to-use !');
			console.log('___________________________________________________________________\r\n\r\n\r\n');
		}
	});
}

client.on('ready', () => {
	client.user.setGame(`${config.prefix}help`);
});

client.on('message', msg => {

	// don't answer to bots
	if (msg.author.bot) return;

	// ignore regular messages
	if (msg.content.indexOf(config.prefix) !== 0) return;

	const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command == 'alerts') {

		if (!msg.member.hasPermission('ADMINISTRATOR')) {
			errors.sendError('NO_RIGHTS', msg);
			return;
		}

		if (args.length !== 0) {

			// enable alerts
			if (args[0] == 'on') {
				// get a connection from the pool
				db.getConnection((coerr, connection) => {

					if (coerr) {
						errors.sendError('DB', msg);
						return;
					}

					// query the db
					let sql = 'UPDATE datf2bot SET alerts = true WHERE guild_id = ?';

					connection.query(sql, [msg.guild.id], reqerr => {

						connection.release();
						if (reqerr) {
							erros.sendError('QUERY');
							return;
						}
						msg.channel.send('Enabled TF2 updates alerts');

					});
				});

				// disable alerts
			} else if (args[0] == 'off') {
				db.getConnection((coerr, connection) => {

					if (coerr) {
						errors.sendError('DB', msg);
						return;
					}

					let sql = 'UPDATE datf2bot SET alerts = false WHERE guild_id = ?';

					connection.query(sql, [msg.guild.id], reqerr => {

						connection.release();
						if (reqerr) {
							errors.sendError('QUERY', msg);
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
			db.getConnection((coerr, connection) => {

				if (coerr) {
					errors.sendError('DB', msg);
					return;
				}

				let sql = 'SELECT alerts FROM datf2bot WHERE guild_id = ?';

				connection.query(sql, [msg.guild.id], (reqerr, res) => {

					connection.release();
					if (reqerr) {
						errors.sendError('QUERY', msg);
						return;
					}
					msg.channel.send('TF2 updates alerts are ' + (res[0].alerts ? 'on' : 'off'));
				});
			});
		}

	} else if (command == 'lastupdate') {
		fs.readFile('lastupdate.json', (err, data) => {

			if (err) {
				errors.sendError('FETCH_UPDATE', msg);
				return;
			}

			db.getConnection((coerr, connection) => {

				if (coerr) {
					errors.sendError('DB', msg)
					return;
				}

				let sql = 'SELECT lang FROM datf2bot WHERE guild_id = ?'

				db.query(sql, [msg.guild.id], (reqerr, res) => {

					connection.release();
					if (reqerr) {
						errors.sendError('QUERY', msg)
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

	} else if (command == 'lang') {

		if (!msg.member.hasPermission('ADMINISTRATOR')) {
			errors.sendError('NO_RIGHTS', msg);
			return;
		}

		if (args.length !== 0) {
			if (translations[args[0].toLowerCase()]) {
				// translation is available, register the new guild language in the database
				db.getConnection((coerr, connection) => {

					if (coerr) {
						errors.sendError('DB', msg);
						return;
					}

					let sql = 'UPDATE datf2bot SET lang = ? WHERE guild_id = ?';

					connection.query(sql, [args[0].toLowerCase(), msg.guild.id], reqerr => {

						connection.release();
						if (reqerr) {
							errors.sendError('QUERY', msg);
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
			db.getConnection((coerr, connection) => {

				if (coerr) {
					errors.sendError('DB', msg);
					return;
				}

				let sql = 'SELECT lang FROM datf2bot WHERE guild_id = ?';

				db.query(sql, [msg.guild.id], (reqerr, res) => {

					connection.release();
					if (reqerr) {
						errors.sendError('QUERY', msg);
						return;
					}

					msg.channel.send(`Current language: ${res[0].lang}`);
				});
			});
		}
	} else if (command == 'help') {
		if (args.length == 0) {
			msg.channel.send(
				`List of commands:\n\n`
				+ `${config.prefix}alerts (admin only)\n`
				+ `${config.prefix}lang (admin only)\n`
				+ `${config.prefix}lastupdate (everyone)\n`
				+ `\nFor further help, use ${config.prefix}help COMMAND_NAME`
			);
		} else {
			if (args[0] == 'alerts') {
				// doc to write here but im way too lazy
			}
		}
	}
});

// on guild enter
client.on('guildCreate', guild => {
	// defaultchannel "hack"
	let defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
	// send a welcome message
	defaultChannel.send(`Hi ! I\'m your new TF2 Bot !\nI can notify the whole server every time an update drops.\nUse ${config.prefix}help for help !`);

	// add the guild to the database
	db.getConnection((coerr, connection) => {

		if (coerr) {
			errors.sendError('DB', msg);
			return;
		}
		let sql = 'INSERT INTO datf2bot (guild_id, alerts, lang) VALUES (?, true, "en")';

		connection.query(sql, [guild.id], reqerr => {

			connection.release();
			if (reqerr) {
				errors.sendError('QUERY', msg);
				return;
			}
		});
	});
});

// on guild kick
client.on('guildDelete', guild => {
	// remove guild from db
	db.getConnection((coerr, connection) => {

		if (coerr) {
			errors.sendError('DB');
			return;
		}
		let sql = 'DELETE FROM datf2bot WHERE guild_id = ?';

		connection.query(sql, [guild.id], (reqerr) => {

			connection.release();
			if (reqerr) {
				errors.sendError('QUERY');
				return;
			}
		});
	});
});

//
updates.on('new', update => {

	let sql = 'SELECT guild_id, lang FROM datf2bot WHERE alerts = true';

	db.getConnection((coerr, connection) => {

		if (coerr) {
			errors.sendError('DB');
			return;
		}
		connection.query(sql, (reqerr, res) => {

			connection.release();
			if (reqerr) {
				errors.sendError('QUERY');
				return;
			}

			var translatedUpdate = {};

			for (let i = 0; i < res.length; i++) {

				// get the guild
				let guild = client.guilds.get(res[i].guild_id);

				// if the translation for this message hasn't been done yet, do it (for performance purposes, don't translate at each iteration)
				let guildlang = res[i].lang;

				if (!translatedUpdate[guildlang]) {

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
				if (updateChannel) {
					updateChannel.send(translatedUpdate[guildlang]);
				} else { // fallback to default channel
					let defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
					defaultChannel.send(translatedUpdate[guildlang]);
				}
			}
		});
	});
});
