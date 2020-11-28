const d3 = require('d3');

const secret = typeof(_secret) !== "undefined" ? _secret : {};
const rooturl='http://configame.h25.io/';
const config = {
	mode:"live",
	// mode:"replay",
	urls: {
		root: rooturl,
		king:  rooturl+'getKing',
		score: rooturl+'scoreboard',
		tick:  rooturl+'getPreviousTick',
		image: rooturl+'image',
		post: (x, y) => rooturl + 'setPosition?x=' + Math.round(x) + '&y=' + Math.round(y) + '&token=' + secret.token,
	},
	replayFile: '../data/latest.json',
	origin: {
		width: 200,
		height: 200,
	},
	canvas: {
		width : 200,
		height : 200,
	},
	timing: {
		period: 60,
		phase: 5,
		loop: 1000,
		transition: 3000,
	},
}
