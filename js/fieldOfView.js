
function castLight(x, y, range, callback)
{
	callback(x, y);
	castLight_0(x, y, 1, range, -1.0, 1.0, callback);
	castLight_1(x, y, 1, range, -1.0, 1.0, callback);
	castLight_2(x, y, 1, range, -1.0, 1.0, callback);
	castLight_3(x, y, 1, range, -1.0, 1.0, callback);
}

function castLight_0(x, y, dist, range, fmin, fmax, callback)
{
	if (dist >= range)
		return;
	if (fmin >= fmax)
		return;
	var n0 = Math.floor(dist * fmin + 0.5);
	var n1 = Math.floor(dist * fmax + 0.5);

	var m = Math.floor(Math.sqrt((range * range) - (dist * dist)));
	if (n0 < -m) n0 = -m;
	if (n0 > m) return;
	if (n1 > m) n1 = m;
	if (n1 < -m) return;

	if (y+n0 < 0) n0 = -y;
	if (y+n1 < 0) return;
	if (y+n0 >= map.height) return;
	if (y+n1 >= map.height) n1 = map.height - y - 1;
	
	if (x+dist >= map.width) return;
	
	for(var n=n0; n<=n1;n++)
	{
		callback(x+dist, y+n);
		if (map.tiles[x+dist][y+n].type >= 16)
		{
			tmpMax = Math.min((n - 0.5) / (dist - 0.5), (n - 0.5) / (dist + 0.5));
			castLight_0(x, y, dist+1, range, fmin, Math.min(tmpMax, fmax), callback);
			fmin = Math.max((n + 0.5) / (dist - 0.5), (n + 0.5) / (dist + 0.5));
		}
	}
	castLight_0(x, y, dist+1, range, fmin, fmax, callback);
}

function castLight_1(x, y, dist, range, fmin, fmax, callback)
{
	if (dist >= range)
		return;
	if (fmin >= fmax)
		return;
	var n0 = Math.floor(dist * fmin + 0.5);
	var n1 = Math.floor(dist * fmax + 0.5);

	var m = Math.floor(Math.sqrt((range * range) - (dist * dist)), callback);
	if (n0 < -m) n0 = -m;
	if (n0 > m) return;
	if (n1 > m) n1 = m;
	if (n1 < -m) return;
	
	if (y+n0 < 0) n0 = -y;
	if (y+n1 < 0) return;
	if (y+n0 >= map.height) return;
	if (y+n1 >= map.height) n1 = map.height - y - 1;

	if (x-dist < 0) return;
	
	for(var n=n0; n<=n1;n++)
	{
		callback(x-dist, y+n);
		if (map.tiles[x-dist][y+n].type >= 16)
		{
			tmpMax = Math.min((n - 0.5) / (dist - 0.5), (n - 0.5) / (dist + 0.5));
			castLight_1(x, y, dist+1, range, fmin, Math.min(tmpMax, fmax), callback);
			fmin = Math.max((n + 0.5) / (dist - 0.5), (n + 0.5) / (dist + 0.5));
		}
	}
	castLight_1(x, y, dist+1, range, fmin, fmax, callback);
}

function castLight_2(x, y, dist, range, fmin, fmax, callback)
{
	if (dist >= range)
		return;
	if (fmin >= fmax)
		return;
	var n0 = Math.floor(dist * fmin + 0.5);
	var n1 = Math.floor(dist * fmax + 0.5);

	var m = Math.floor(Math.sqrt((range * range) - (dist * dist)));
	if (n0 < -m) n0 = -m;
	if (n0 > m) return;
	if (n1 > m) n1 = m;
	if (n1 < -m) return;

	if (x+n0 < 0) n0 = -x;
	if (x+n1 < 0) return;
	if (x+n0 >= map.width) return;
	if (x+n1 >= map.width) n1 = map.width-x-1;
	
	if (y+dist >= map.height) return;
	for(var n=n0; n<=n1;n++)
	{
		callback(x+n, y+dist);
		if (map.tiles[x+n][y+dist].type >= 16)
		{
			tmpMax = Math.min((n - 0.5) / (dist - 0.5), (n - 0.5) / (dist + 0.5));
			castLight_2(x, y, dist+1, range, fmin, Math.min(tmpMax, fmax), callback);
			fmin = Math.max((n + 0.5) / (dist - 0.5), (n + 0.5) / (dist + 0.5));
		}
	}
	castLight_2(x, y, dist+1, range, fmin, fmax, callback);
}

function castLight_3(x, y, dist, range, fmin, fmax, callback)
{
	if (dist >= range)
		return;
	if (fmin >= fmax)
		return;
	var n0 = Math.floor(dist * fmin + 0.5);
	var n1 = Math.floor(dist * fmax + 0.5);
	
	var m = Math.floor(Math.sqrt((range * range) - (dist * dist)));
	if (n0 < -m) n0 = -m;
	if (n0 > m) return;
	if (n1 > m) n1 = m;
	if (n1 < -m) return;

	if (x+n0 < 0) n0 = -x;
	if (x+n1 < 0) return;
	if (x+n0 >= map.width) return;
	if (x+n1 >= map.width) n1 = map.width-x-1;
	
	if (y-dist < 0) return;
	for(var n=n0; n<=n1;n++)
	{
		callback(x+n, y-dist);
		if (map.tiles[x+n][y-dist].type >= 16)
		{
			tmpMax = Math.min((n - 0.5) / (dist - 0.5), (n - 0.5) / (dist + 0.5));
			castLight_3(x, y, dist+1, range, fmin, Math.min(tmpMax, fmax), callback);
			fmin = Math.max((n + 0.5) / (dist - 0.5), (n + 0.5) / (dist + 0.5));
		}
	}
	castLight_3(x, y, dist+1, range, fmin, fmax, callback);
}
