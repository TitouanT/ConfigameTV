function runAnimation(duration, animation) {
	const start = Date.now();
	const animTime = () => (Date.now() - start) / duration;
	
	return new Promise((resolve, reject) => {

		function during() {
			const t = animTime();
			animation(t);
			if (t < 1) window.requestAnimationFrame(during);
			else window.requestAnimationFrame(conclude);
		}

		function conclude() {
			animation(1);
			window.requestAnimationFrame(resolve);
		}
		window.requestAnimationFrame(during);
		
	});
}

// changes flatA in place
function flatInterpolator(flatA, flatB) {
	const timed = flatA.points
		.map((v, i) => [v, flatB.points[i]]) // zip du pauvre
		.map(([a, b]) =>  d3.interpolateNumber(a, b));

	return t => {
		for (let i = 0; i < timed.length; i += 1)
			flatA.points[i] = timed[i](t);
	}
}

function flatConvertPoint(flat, id, origin, canvas) {
	const point = flat.get(id);
	const converted = convertPoint(...point, origin, canvas);
	flat.set(id, converted);
}

function mkAnimation(rawA, rawB, canvas) {
	const { context } = canvas;
	const aligned = alignState(rawA, rawB);

	function getTimedVoronoi({start, end, ids}) {
		const flatStart = mkFlat(start);
		const flatEnd = mkFlat(end);
		for (id of flatStart.ids) {
			flatConvertPoint(flatStart, id, config.origin, canvas);
			flatConvertPoint(flatEnd, id, config.origin, canvas);
		}
		const ft = flatInterpolator(flatStart, flatEnd);
		const voronoi = mkVoronoi(flatStart, canvas.width, canvas.height);
		return {voronoi, ft}
	}

	function getTimedCellRenderer(aligned, voronoi) {
		return t => {
			for (id of aligned.ids) {
				let color = d3.color(aligned.start[id].team);
				if (id === secret.userid) {
					color = color.darker(1);
				}
				color.opacity = t;
				const black = d3.color('black');
				black.opacity = t;
				const index = voronoi.flat.id2index[id];

				context.beginPath();
				voronoi.graph.renderCell(index, context);

				context.fillStyle = color;
				context.fill();
				context.strokeStyle = black;
				context.stroke();
			}
		}
	}
	const movingA = getTimedVoronoi(aligned.appearing);
	const movingD = getTimedVoronoi(aligned.disappearing);
	const moving  = getTimedVoronoi(aligned.moving);

	const appear   = getTimedCellRenderer(aligned.appearing, movingA.voronoi);
	const disappear = getTimedCellRenderer(aligned.disappearing, movingD.voronoi);

	const appearrange = [0.5, 1];
	const disappearrange = [0, 0.8];

	return t => {
		const vt = d3.easeSinInOut(t);
		moving.ft(vt);
		canvas.data  = {voronoi:moving.voronoi, raw:aligned.moving.start};
		drawVoronoi(canvas, 1);


		if (t <= disappearrange[1] && t >= disappearrange[0]) {
			const local_t = map(t, ...disappearrange, 1, 0);
			movingD.ft(vt);
			canvas.data = {voronoi:movingD.voronoi, raw:aligned.disappearing.start};
			drawVoronoi(canvas, local_t);
		}
		if (t <= appearrange[1] && t >= appearrange[0]) {
			const local_t = map(t, ...appearrange, 0, 1)
			movingA.ft(vt);
			canvas.data = {voronoi:movingA.voronoi, raw:aligned.appearing.start};
			drawVoronoi(canvas, local_t);
		}
	}
}

function alignState(rawA, rawB) {
	rawA = {...rawA};
	rawB = {...rawB};
	const commonIds = Object.keys(rawA).filter(k => k in rawB);
	const disappearingIds = Object.keys(rawA).filter(k => !(k in rawB));
	const appearingIds = Object.keys(rawB).filter(k => !(k in rawA));

	const commonA = {};
	const commonB = {};
	for (k of commonIds) commonA[k] = rawA[k];
	for (k of commonIds) commonB[k] = rawB[k];

	const disappearingB = {...commonB};
	for (k of disappearingIds) disappearingB[k] = rawA[k];

	const appearingA = {...commonA};
	for (k of appearingIds) appearingA[k] = rawB[k];

	return {
		moving: {
			start: commonA,
			end: commonB,
			ids: commonIds,
		},
		disappearing: {
			start: rawA,
			end: disappearingB,
			ids: disappearingIds,
		},
		appearing: {
			start: appearingA,
			end: rawB,
			ids: appearingIds,
		},
	};
}

function drawVoronoi(canvas, alpha) {
	if (alpha === undefined) alpha = 1;
	const {context, width, height} = canvas;
	const voronoi = canvas.data.voronoi;
	const graph = voronoi.graph;
	graph.update();

	// context.clearRect(0, 0, width, height);

	voronoi.flat.ids.forEach(id => {
		let color = d3.color(canvas.data.raw[id].team);
		color.opacity = alpha;
		if (id == secret.userid) color = color.darker(1);
		const index = voronoi.flat.id2index[id];
		context.fillStyle = color;

		context.beginPath();
		graph.renderCell(index, context);
		context.fill();
	})

	const black = d3.color('black');
	black.opacity = alpha;

	context.beginPath();
	graph.render(context);
	graph.renderBounds(context);
	context.strokeStyle = black;
	context.stroke();

	context.beginPath();
	graph.delaunay.renderPoints(context);
	context.fillStyle = black;
	context.fill();
}
