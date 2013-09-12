var unitList = new Array();
var actQueue = null;
var unitType = {}
unitType[0] = {
	sprite: 0,
	name: 'Commander',
	health: 10,
}
unitType[1] = {
	sprite: 1,
	name: 'Marine',
	health: 5,
}

unitType[16] = {
	sprite: 35,
	name: 'Gretchin',
	health: 2,
}
unitType[17] = {
	sprite: 18,
	name: 'Orc',
	health: 3,
}
unitType[18] = {
	sprite: 48,
	name: 'Android',
	health: 4,
}
unitType[19] = {
	sprite: 2,
	name: 'Chaos Marine',
	health: 5,
}
unitType[20] = {
	sprite: 19,
	name: 'Genestealer',
	health: 4,
}
unitType[21] = {
	sprite: -1,
	name: 'Dreadnought',
	health: 100,
}

function Unit(type, x, y)
{
	this.typeId = type;
	this.type = unitType[type];
	this.x = x;
	this.y = y;
	this.hp = this.type.health;
	this.maxHp = this.type.health;
	this.actDelay = 1;
	this.actNext = null;
	
	map.tiles[x][y].unit = this;
	unitList.push(this);
	insertIntoActQueue(this, 1);
	
	if (typeof(this.isPlayer) == 'undefined')
	{
		Unit.prototype.isPlayer = function()
		{
			return this.typeId == 0;
		}
		Unit.prototype.isFriendly = function()
		{
			return this.typeId < 16;
		}
		Unit.prototype.isEnemy = function()
		{
			return this.typeId >= 16;
		}
		Unit.prototype.move = function(x ,y)
		{
			if (x < 0 || x >= map.width) return false;
			if (y < 0 || y >= map.height) return false;
			var swap = null;
			if (map.tiles[x][y].unit)
			{
				//If we are the player and we are moving into a friendly unit, swap our location with that unit.
				if (this.isPlayer() && map.tiles[x][y].unit.isFriendly())
				{
					swap = map.tiles[x][y].unit;
					swap.x = this.x;
					swap.y = this.y;
				}else{
					return false;
				}
			}
			if (map.tiles[x][y].type == 16) return false;
			if (map.tiles[x][y].type == 17)
			{
				map.tiles[x][y].type = 8;
				if (map.tiles[x-1][y].type == 17) map.tiles[x-1][y].type = 8;
				if (map.tiles[x+1][y].type == 17) map.tiles[x+1][y].type = 8;
				if (map.tiles[x][y-1].type == 17) map.tiles[x][y-1].type = 8;
				if (map.tiles[x][y+1].type == 17) map.tiles[x][y+1].type = 8;
			}

			map.tiles[this.x][this.y].unit = swap;
			map.tiles[x][y].unit = this;

			//Close doors behind enemies
			if (this.isEnemy() && map.tiles[this.x][this.y].type == 8)
			{
				if (map.tiles[this.x-1][this.y].type == 8 && map.tiles[this.x-1][this.y].unit == null) { map.tiles[this.x-1][this.y].type = 17; map.tiles[this.x][this.y].type = 17; }
				if (map.tiles[this.x+1][this.y].type == 8 && map.tiles[this.x+1][this.y].unit == null) { map.tiles[this.x+1][this.y].type = 17; map.tiles[this.x][this.y].type = 17; }
				if (map.tiles[this.x][this.y-1].type == 8 && map.tiles[this.x][this.y-1].unit == null) { map.tiles[this.x][this.y-1].type = 17; map.tiles[this.x][this.y].type = 17; }
				if (map.tiles[this.x][this.y+1].type == 8 && map.tiles[this.x][this.y+1].unit == null) { map.tiles[this.x][this.y+1].type = 17; map.tiles[this.x][this.y].type = 17; }
			}
			this.x = x;
			this.y = y;

			insertIntoActQueue(this, 1);
			return true;
		}
		Unit.prototype.attack = function(x, y)
		{
			if (map.tiles[x][y].unit)
				addMessage(this.type.name + " fires a shot at " + map.tiles[x][y].unit.type.name);
			else
				addMessage(this.type.name + " fires a shot into the air");
			addShotVisual(this.x, this.y, x, y);
			insertIntoActQueue(actQueue, 2);
		}
		Unit.prototype.draw = function()
		{
			if (map.tiles[this.x][this.y].vis < 2)
				return;
			drawHealth(this.x-map.viewX, this.y-map.viewY, this.hp, this.maxHp);
			drawSprite(this.x-map.viewX, this.y-map.viewY, this.type.sprite);
		}
	}
	return this;
}

function insertIntoActQueue(unit, delay)
{
	if (actQueue == unit) actQueue = actQueue.actNext;
	unit.actDelay = delay;
	if (actQueue == null)
	{
		actQueue = unit;
		unit.actNext = null;
	}else{
		var u = actQueue;
		while(u.actNext != null && u.actNext.actDelay <= unit.actDelay)
			u = u.actNext;
		unit.actNext = u.actNext;
		u.actNext = unit;
	}
}

function updateActQueue()
{
	if (actQueue == null) return;
	var delayZero = actQueue.actDelay;
	if (delayZero > 0)
		for(var u=actQueue; u!=null; u=u.actNext)
			u.actDelay -= delayZero;
	
	while(player != actQueue)
	{
		var delayZero = actQueue.actDelay;
		if (delayZero > 0)
			for(var u=actQueue; u!=null; u=u.actNext)
				u.actDelay -= delayZero;
		
		var u = actQueue;
		
		if (u.isFriendly())
		{
			friendlyAI(u);
		}else{
			//TODO: EnemyAI
			if (random(0, 100) < 50) {
				if (random(0, 100) < 50) u.move(u.x - 1, u.y); else u.move(u.x + 1, u.y);
			}else{
				if (random(0, 100) < 50) u.move(u.x, u.y - 1); else u.move(u.x, u.y + 1);
			}
		}
		
		if (u == actQueue)//If no action was done, then do nothing for 1 time unit.
			insertIntoActQueue(actQueue, 1);
	}
}
