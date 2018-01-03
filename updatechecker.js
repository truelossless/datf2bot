// checks for TF2 updates every 10 seconds.

// http requests
const request = require('request');

// DOM  JQuery-like parser
const cheerio = require('cheerio');

const fs = require('fs');

// errors handler
const errors = require('./errors');

var EventEmitter = require('events').EventEmitter;
exports.updates = new EventEmitter;

function checkForUpdates() {
	request('http://teamfortress.com?tab=updates', function(error, response, body) {
		if(!error && response.statusCode == 200) {
			const $ = cheerio.load(body);
			fs.readFile('lastupdate.json', (err, data) => {
				
				if(err) {
					errors.sendError('FETCH_UPDATE');
					return;
				}
				
				// convert data into an object
				data = JSON.parse(data);

				// update id based on post id
				try { // to make sure that html was succefully parsed
					var updateId = ($('.postLink').first().attr('href')).slice(12);
				} catch (stringError) {
					errors.sendError('HTML')
					return;
				}
				
				if(data.id != updateId) { // new update because ids are different
					
					// date formatting
					let parsedDate = $('h2').first().text().slice(0, -11);
					data.date.month = parsedDate.match(/[A-Za-z]+/)[0];
					data.date.day = parsedDate.match(/[0-9]+/)[0];
					data.date.year = parsedDate.match(/[0-9]+$/)[0];
					// if there are bold tags, it must be a major update
					data.majorupdate = !!$('ul').first().find('b').get().length;
					// get the number of changes based on number of <li>, excluding these representing a category of changes, therefore not a change themselves.
					data.changes = ($('ul').first().find('li').get().length) - ($('ul').first().find('li ul').get().length);
					data.id = updateId;
					
					fs.writeFile('lastupdate.json',  JSON.stringify(data, null, 4));
					
					console.log('New TF2 update !');
					exports.updates.emit('new', data);
				}
			});
		}
	});
}

checkForUpdates();
setInterval(checkForUpdates, 10000);
