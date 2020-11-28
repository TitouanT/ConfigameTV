// if 2 data object share the same keys, the points will be aligned.
function mkFlat(data) {
	const ids = Object.keys(data).sort();

	const id2index = ids.reduce((acc, v, index) => {
		acc[v] = index;
		return acc;
	}, {});

	const id2flatindex = {};
	for (k in id2index) id2flatindex[k] = 2*id2index[k];

	const points = ids.map(k => data[k].position).flat();
	const get = id => {
		const index = id2flatindex[id];
		return points.slice(index, index + 2);
	};
	const set = (id, [x, y]) => {
		const index = id2flatindex[id];
		return points.splice(index, 2, x, y);
	};
	return { ids, points, get, set, id2index };
}


function mkVoronoi (flat, width, height) {
	return {
		graph: new d3.Delaunay(flat.points).voronoi([0, 0, width, height]),
		width,
		height,
		flat,
	};
}

function mkCanvas(id, width, height) {
	const canvas = d3.select(id)
	const context = canvas.node().getContext('2d');
	const mycanvas = {canvas, context};
	function resize(w, h) {
		canvas.attr('width', w);
		canvas.attr('height', h);
		canvas.style({w, h});
		mycanvas.width = w;
		mycanvas.height = h;
	}
	resize(width, height);
	mycanvas.resize = resize;
	return mycanvas;
}

