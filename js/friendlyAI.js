
function friendlyAI(unit)
{
	var enemyList = new Array();
	castLight(unit.x, unit.y, 10, function(x, y) {
		if (map.tiles[x][y].unit && map.tiles[x][y].unit.isEnemy())
		{
			if (traceLine(unit.x, unit.y, x, y, function(x, y) { return map.tiles[x][y].type >= 16; }))
				enemyList.push(map.tiles[x][y].unit);
		}
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
