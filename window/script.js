const windowWatcher = [];
window.onresize = () => {
	console.log('resized ! ', windowWatcher.length);
	const w = window.innerWidth;
	const h = window.innerHeight;
	windowWatcher.forEach(watcher => watcher(w, h))
}

function replayMode() {
	let previousTick = {};
	let size = Math.min(window.innerWidth, window.innerHeight);
	const tickCanvas = mkCanvas("#tick", size, size);
	windowWatcher.push((w, h) => {
		const size = Math.min(w, h);
		tickCanvas.resize(size, size);
	});

	function anim() {
		getPreviousTick( [ tick => {
			const animation = mkAnimation(previousTick, tick, tickCanvas);
			runAnimation(config.timing.loop, animation).then(() => {
				previousTick = tick;
				if (tick) anim();
			}).catch(err => console.log('animation error', err));
		}]);
	}
	anim();
}

function liveMode() {
	let previousTick = {};
	let size = Math.min(window.innerWidth, window.innerHeight);
	const tickCanvas = mkCanvas("#tick", size, size);
	const nop = () => {};
	tickCanvas.draw = nop;
	windowWatcher.push((w, h) => {
		const size = Math.min(w, h);
		tickCanvas.resize(size, size);
		tickCanvas.draw();
	});

	tickCanvas.canvas.on('click', e => {
		const point = convertPoint(e.layerX, e.layerY, tickCanvas, config.origin);
		if (secret.token) setPosition(...point);
		else console.log('Setup your token in secret.js (copy dummy_secret.js)');
	}, false);

	periodicUpdate(
		getPreviousTick,
		config.timing.period,
		config.timing.phase,
		[tick => {
			const animation = mkAnimation(previousTick, tick, tickCanvas);
			tickCanvas.draw = nop;

			runAnimation(config.timing.transition, animation).then(() => {
				tickCanvas.draw = () => {
					const flat = mkFlat(tick);
					for (id in tick) {
						flat.set(id, convertPoint(...flat.get(id), config.origin, tickCanvas));
					}
					const voronoi = mkVoronoi(flat, tickCanvas.width, tickCanvas.height);
					tickCanvas.data = { raw:tick, voronoi }
					drawVoronoi(tickCanvas);
				}
				tickCanvas.draw();
				previousTick = tick;
			}).catch(err => console.log('animation error', err));
		}],
	);
}

function main() {
	const modes = {
		live: liveMode,
		replay: replayMode,
	}
	modes[config.mode]();
}
main();
