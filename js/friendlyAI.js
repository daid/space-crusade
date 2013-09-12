
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
			return {x: item.base.x, y: item.base.y};
		
		if (map.tiles[item.x-1][item.y].type != 16) addToList(item.x-1, item.y, item);
		if (map.tiles[item.x+1][item.y].type != 16) addToList(item.x+1, item.y, item);
		if (map.tiles[item.x][item.y-1].type != 16) addToList(item.x, item.y-1, item);
		if (map.tiles[item.x][item.y+1].type != 16) addToList(item.x, item.y+1, item);
	}
	return null;
}

function friendlyAI(unit)
{
	if (random(0, 100) < 50) return;

	var enemyList = new Array();
	castLight(unit.x, unit.y, 20, function(x, y) {
		if (map.tiles[x][y].unit && map.tiles[x][y].unit.isEnemy())
			enemyList.push(map.tiles[x][y].unit);
	});
	if (enemyList.length > 0)
	{
		unit.attack(enemyList[0].x, enemyList[0].y);
		return;
	}

	target = planPath(unit.x, unit.y, player.x, player.y);
	if (!target) return;
	unit.move(target.x, target.y);
}
