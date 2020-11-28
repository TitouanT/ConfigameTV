function periodicUpdate(f, period, phase, arg) {
	f(arg);
	const UTC_seconds = (Date.now() / 1000 - phase) % period | 0;
	setTimeout(periodicUpdate, (period-UTC_seconds) * 1000, f, period, phase, arg);
}

function getJsonReplay() {
	let counter = -1;
	let file = require(config.replayFile);
	const n = file.length;
	function getJson(url, callback) {
		counter += 1;
		if (counter < n) {
			let tick = file[counter];
			if ('timestamp' in tick) tick = tick.data;
			return callback(tick);
		}
		return callback({});
	}
	return getJson;
}
const getJson = config.mode === 'live' ? (url, callback) => fetch(url).then(data => data.json()).then(callback) : getJsonReplay();


function setPosition(x, y) {
	fetch(config.urls.post(x, y))
		.then(msg => console.log("OK", x.toFixed(), y.toFixed()))
		.catch(err => console.log('Illegal move or configame is not up', err));
}

function getPreviousTick(observers) {
	console.log('Fetching !');
	getJson(config.urls.tick, data => {
		for (k in data) {
			data[k].team = data[k].team.toLowerCase();
		}
		observers.forEach(f => f(data));
	});
}
