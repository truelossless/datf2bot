var updates = require('./updatechecker').updates;

// db-related settings must be put in this json file
const config = require('./config.json');

const mysql = require('mysql');

var db = mysql.createPool({
	host: config.mysql.host,
	user: config.mysql.user,
	database: config.mysql.database,
	password: config.mysql.password,
	// mandatory to handle guilds id
	supportBigNumbers: true
});

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.token);

client.on('ready', () => {
  client.user.setGame('!:help');
})

client.on('message',  msg => {
	// don't answer to bots
	if(msg.author.bot) return;
	// ignore regular messages
	if(msg.content.indexOf('!:') !== 0) return;

	const args = msg.content.slice(2).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if(command == 'alerts') {
		if(!msg.member.hasPermission('ADMINISTRATOR')) {
			msg.reply('you do not have access to this command');
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
				msg.channel.send('Syntax: !:alerts [on|off]');
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
	}
});

// on guild enter
client.on('guildCreate', guild => {
	// defaultchannel "hack"
	var defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
	// send a welcome message
	defaultChannel.send('Hi ! I\'m your new TF2 Bot !\nI can notify the whole server every time an update drops.\nUse !:help for help !');
	
	// add the guild to the database
	db.getConnection( (coerr, connection) => {
		if(coerr) {
			msg.channel.send('An error has occured, try again later.');
			console.log(coerr);
			return;
		}
		let sql = 'INSERT INTO datf2bot (guild_id, alerts) VALUES (?, true)';
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
			msg.channel.send('An error has occured, try again later.');
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
	let sql = 'SELECT guild_id FROM datf2bot WHERE alerts = true';
	db.getConnection( (coerr, connection) => {
		if(coerr) {
			msg.channel.send('An error has occured, try again later.');
			console.log(coerr);
			return;
		}
		connection.query(sql, (reqerr, res) => {
			connection.release();
			if(reqerr) {
				console.log(reqerr);
				return;
			}
			
			for(let i=0;i<res.length;i++) {
				let guild = client.guilds.get(res[i]['guild_id']);
				let updateChannel = guild.channels.find('name', 'tf2updates');
				if(updateChannel) {
					updateChannel.send(update);
				} else {
					let defaultChannel = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || a.id - b.id).first();
					defaultChannel.send(update);
				}
			}
		});
	});
});
