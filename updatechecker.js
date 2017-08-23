// checks for TF2 updates every 2 minutes.

var fs = require('fs');
var request = require('request');
const cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter;
exports.updates = new EventEmitter;

function checkForUpdates() {
	request('http://teamfortress.com?tab=updates', function(error, response, body) {
		if(response.statusCode == 200 && !error) {
			const $ = cheerio.load(body);
			fs.readFile('lastupdate.txt', (err, lastUpdateId) => {
				if(!err) {
					var updateId = ($('.postLink').first().attr('href')).slice(12);
					if(lastUpdateId != updateId) {
						// new update because ids are different
						fs.writeFile('lastupdate.txt',  updateId);
						
						let update = 'New TF2 Update !';
						// date
						update += '\n' + ($('h2').first().text()).slice(0, -11);
						// if there is bold tags, it must be a major update
						update += '\n' + ($('ul').first().find('b').get().length !== 0 ? 'Major update' : 'Minor update');
						// get the number of changes based on number of <li>, excluding these representing a category of change, therefore not a change themselves.
						update += ' (' + (($('ul').first().find('li').get().length) - ($('ul').first().find('li ul').get().length)) + ' changes)';
						update += '\nhttp://teamfortress.com/' + $('.postLink').first().attr('href');
						
						console.log(update);
						exports.updates.emit('new', update);
					}
				}
			});
		}
	});
}

checkForUpdates();
setInterval(checkForUpdates, 10000);