
function enemyAI(unit)
{
	if (random(0, 100) < 50) return;

	var enemyList = new Array();
	castLight(unit.x, unit.y, 20, function(x, y) {
		if (map.tiles[x][y].unit && map.tiles[x][y].unit.isFriendly())
		{
			if (traceLine(unit.x, unit.y, x, y, function(x, y) { return map.tiles[x][y].type >= 16; }))
				enemyList.push(map.tiles[x][y].unit);
		}
	});
	if (enemyList.length > 0)
	{
		//unit.attack(enemyList[0].x, enemyList[0].y);
		return;
	}

	target = planPath(unit.x, unit.y, player.x, player.y);
	if (!target || target.score > 20) return;
	unit.move(target.x, target.y);

return;
	if (random(0, 100) < 50) {
		if (random(0, 100) < 50) unit.move(unit.x - 1, unit.y); else unit.move(unit.x + 1, unit.y);
	}else{
		if (random(0, 100) < 50) unit.move(unit.x, unit.y - 1); else unit.move(unit.x, unit.y + 1);
	}
}
