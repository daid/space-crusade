
//Should optimize this to A* one day.
function planPath(x0, y0, x1, y1)
{
	var openList = {x: x0, y: y0, score: 1, base: null, next: null};
	var doneMap = {};
	
	addToList = function(x, y, base)
	{
		if (doneMap[x + y * map.width]) return;
		doneMap[x + y * map.width] = 1;

		var item = {x: x, y: y, score: base.score + 1, base: base.base, next: null};
		if (map.tiles[x][y].unit) item.score += 1;
		if (item.base == null) item.base = item;
		if (openList == null || openList.score > item.score)
		{
			item.next = openList;
			openList = item;
		}else{
			var i = openList;
			while(i.next != null && i.next.score < item.score)
				i = i.next;
			item.next = i.next;
			i.next = item;
		}
	}
	
	while(openList != null)
	{
		var item = openList;
		openList = openList.next;
		if (item.x == x1 && item.y == y1)
			return {x: item.base.x, y: item.base.y, cost: item.cost};
		
		if (map.tiles[item.x-1][item.y].type != 16) addToList(item.x-1, item.y, item);
		if (map.tiles[item.x+1][item.y].type != 16) addToList(item.x+1, item.y, item);
		if (map.tiles[item.x][item.y-1].type != 16) addToList(item.x, item.y-1, item);
		if (map.tiles[item.x][item.y+1].type != 16) addToList(item.x, item.y+1, item);
	}
	return null;
}
