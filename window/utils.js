function map(n, a, b, A, B) {
	const N = (n - a) * (B-A) / (b-a) + A;
	return N;
}

function convertPoint(x, y, src, dst) {
	return [
		map(x, 0, src.width, 0, dst.width),
		map(y, 0, src.height, 0, dst.height)
	];
}

function convexPolygonArea(points) {
	let s = 0;
	for (let i = 0; i < points.length - 1; i += 1) {
		let [a, b] = points[i];
		let [c, d] = points[i+1];
		s += a*d - b*c;
	}
	return s; // true value: 0.5 * s but eeh
}
