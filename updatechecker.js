// checks for TF2 updates every 2 minutes.

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter;
exports.updates = new EventEmitter;

function checkForUpdates() {
	request('http://teamfortress.com?tab=updates', function(error, response, body) {
		if(response.statusCode == 200 && !error) {
			const $ = cheerio.load(body);
			fs.readFile('lastupdate.json', (err, data) => {
				
				if(err) {
					console.log(err);
					return;
				}
				
				// convert data into an object
				data = JSON.parse(data);

				// update id based on post id
				var updateId = ($('.postLink').first().attr('href')).slice(12);
				
				if(data.id != updateId) { // new update because ids are different
					
					// date formatting
					let parsedDate = $('h2').first().text().slice(0, -11);
					data.date.month = parsedDate.match(/[A-Za-z]+/)[0];
					data.date.day = parsedDate.match(/ [0-9]+/)[0];
					data.date.year = parsedDate.match(/[0-9]+$/)[0];
					// if there is bold tags, it must be a major update
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