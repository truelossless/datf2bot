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
			fs.readFile('lastupdate.json', (err, data) => {
				
				if(err) {
					console.log(err);
					return;
				}
				
				// new update because ids are different
				var updateId = ($('.postLink').first().attr('href')).slice(12);
				
				if(data.id != updateId) {
					
					data.date = $('h2').first().text().slice(0, -11);
					// if there is bold tags, it must be a major update
					data.majorupdate = $('ul').first().find('b').get().length;
					// get the number of changes based on number of <li>, excluding these representing a category of changes, therefore not a change themselves.
					data.changes = ($('ul').first().find('li').get().length) - ($('ul').first().find('li ul').get().length);
					// update id based on post id
					data.id = updateId;
					
					let update = `Team Fortress 2 Update Released\n${data.date}\n` + data.majorupdate ? 'Major update' : 'Minor update' + ` (${data.changes} changes)\nhttp://teamfortress.com/post.php?id=${data.id}`;
					
					fs.writeFile('lastupdate.json',  data);
					
					console.log(update);
					exports.updates.emit('new', update);
				}
			});
		}
	});
}

checkForUpdates();
setInterval(checkForUpdates, 10000);