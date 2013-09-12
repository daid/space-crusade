function generateMap()
{
	map.width = 100;
	map.height = 100;
	
	do
	{
		for(var x=0;x<map.width;x++)
		{
			map.tiles[x] = new Array();
			for(var y=0;y<map.height;y++)
				map.tiles[x][y] = {groundTile: 16, vis: 0, type: 0, unit: null};
		}
		
		//Build random corridors from the center out.
		var totalLength = 0;
		for(var n=0; n<4; n++)
			totalLength += buildCorridor(map.width/2, map.height/2, -1);
	} while(totalLength < 200 || totalLength > 600);

	//Expand the corridors to 2 tiles width.
	for(var x=map.width-1;x>0;x--)
	{
		for(var y=map.height-1;y>0;y--)
		{
			if (map.tiles[x-1][y].groundTile == 48 || map.tiles[x][y-1].groundTile == 48 || map.tiles[x-1][y-1].groundTile == 48)
				map.tiles[x][y].groundTile = 48;
		}
	}

	//Add walls around the corridors
	for(var x=1;x<map.width-1;x++)
	{
		for(var y=1;y<map.height-1;y++)
		{
			if (map.tiles[x][y].groundTile == 48)
			{
				if (map.tiles[x-1][y-1].groundTile != 48) map.tiles[x-1][y-1].type = 16;
				if (map.tiles[x-1][y].groundTile != 48) map.tiles[x-1][y].type = 16;
				if (map.tiles[x-1][y+1].groundTile != 48) map.tiles[x-1][y+1].type = 16;
				if (map.tiles[x][y-1].groundTile != 48) map.tiles[x][y-1].type = 16;
				if (map.tiles[x][y+1].groundTile != 48) map.tiles[x][y+1].type = 16;
				if (map.tiles[x+1][y-1].groundTile != 48) map.tiles[x+1][y-1].type = 16;
				if (map.tiles[x+1][y].groundTile != 48) map.tiles[x+1][y].type = 16;
				if (map.tiles[x+1][y+1].groundTile != 48) map.tiles[x+1][y+1].type = 16;
			}
		}
	}
	
	//Search for areas to add rooms in.
	for(var n=0; n<100; n++)
		addRandomRooms();

return;
	for(var x=0;x<map.width;x+=2)
		for(var y=0;y<map.height;y++)
			if (map.tiles[x][y].type == 16)
				map.tiles[x][y].type = 0;
}

function addRandomRooms()
{
	//Find a random area beween 4x4 and 20x20 somewhere touching a corridor and add a bunch of rooms to it.
	var x = random(1, map.width-1);
	var y = random(1, map.height-1);
	if (map.tiles[x][y].groundTile != 16 || map.tiles[x][y].type == 16)
		return false;

	var startX = x;
	var startY = y;
	while(startX > 1 && map.tiles[startX-1][y].type != 16)
		startX--;
	while(startY > 1 && map.tiles[x][startY-1].type != 16)
		startY--;

	var endX = x;
	var endY = y;
	while(endX < map.width-2 && map.tiles[endX+1][y].type != 16)
		endX++;
	while(endY < map.height-2 && map.tiles[x][endY+1].type != 16)
		endY++;
	
	for(x=startX; x<=endX; x++)
		for(y=startY; y<=endY; y++)
			if (map.tiles[x][y].type == 16)
				return false;
	if (endX - startX < 3) return false;
	if (endY - startY < 3) return false;
	if (endX - startX > 20)
	{
		var l = false;
		var r = false;
		for(y=startY; y<=endY; y++)
		{
			if (startX > 1 && map.tiles[startX-2][y].groundTile == 48)
				l = true;
			if (endX < map.width-2 && map.tiles[endX+2][y].groundTile == 48)
				r = true;
		}
		if (!l && !r) return false;
		if (l && r) if (random(0, 100) < 50) l = false;
		if (l)
		{
			endX = startX + random(12, 20);
		}else{
			startX = endX - random(12, 20);
		}
	}
	if (endY - startY > 20)
	{
		var u = false;
		var d = false;
		for(x=startX; x<=endX; x++)
		{
			if (startY > 1 && map.tiles[x][startY-2].groundTile == 48)
				u = true;
			if (endY < map.height-2 && map.tiles[x][endY+2].groundTile == 48)
				d = true;
		}
		if (!u && !d) return false;
		if (u && d) if (random(0, 100) < 50) u = false;
		if (u)
		{
			endY = startY + random(12, 20);
		}else{
			startY = endY - random(12, 20);
		}
	}

	for(x=startX; x<=endX; x++)
		for(y=startY; y<=endY; y++)
			map.tiles[x][y].groundTile = 32;
	for(x=startX-1; x<=endX+1; x++)
	{
		map.tiles[x][startY-1].type = 16;
		map.tiles[x][endY+1].type = 16;
	}
	for(y=startY-1; y<=endY+1; y++)
	{
		map.tiles[startX-1][y].type = 16;
		map.tiles[endX+1][y].type = 16;
	}
	
	//Divide the big room into multiple smaller rooms.
	divideRooms(startX, startY, endX-startX+1, endY-startY+1);
	
	//Add entry doors.
	var n = 0;
	var i = 0;
	while(n < 1 || random(0, 100) < 20)
	{
		i ++;
		if (random(0, 100) < 50)
		{
			x = random(0, 100) < 50 ? startX - 1 : endX + 1;
			y = random(startY, endY-1);
			if ((x > 0 && map.tiles[x-1][y].groundTile == 48) || (x < map.width - 1 && map.tiles[x+1][y].groundTile == 48))
			{
				if (x > 0 && map.tiles[x-1][y].type < 16 && map.tiles[x-1][y+1].type < 16 && x < map.width - 1 && map.tiles[x+1][y].type < 16 && map.tiles[x+1][y+1].type < 16)
				{
					map.tiles[x][y].type = 17;
					map.tiles[x][y+1].type = 17;
					n++;
				}
			}
		}else{
			x = random(startX, endX-1);
			y = random(0, 100) < 50 ? startY - 1 : endY + 1;
			if ((y > 0 && map.tiles[x][y-1].groundTile == 48) || (y < map.height - 1 && map.tiles[x][y+1].groundTile == 48))
			{
				if (y > 0 && map.tiles[x][y-1].type < 16 && map.tiles[x+1][y-1].type < 16 && y < map.height - 1 && map.tiles[x][y+1].type < 16 && map.tiles[x+1][y+1].type < 16)
				{
					map.tiles[x][y].type = 17;
					map.tiles[x+1][y].type = 17;
					n++;
				}
			}
		}
		if (i > 200) break;
	}
	if (n < 1)
	{
		//Failed to add an entry door. Remove all rooms.
		for(x=startX; x<=endX; x++)
			for(y=startY; y<=endY; y++)
			{
				map.tiles[x][y].type = 0;
				map.tiles[x][y].groundTile = 16;
			}
		return false;
	}
	return true;
}

function divideRooms(x1, y1, w, h)
{
	var allowHorizontal = (w > 8);//We need 9 tiles to split up the room, as a room needs to be 4 tiles width to fit in doors.
	var allowVertical = (h > 8);
	if (!allowHorizontal && !allowVertical)
	{
		new Unit(random(16, 20), x1 + random(0, w), y1 + random(0, h));
		return;
	}
	
	if (allowHorizontal && allowVertical)
	{
		if (random(0, 100) < 50 - w + h) allowHorizontal = false;
	}
	
	if (allowHorizontal)
	{
		if (random(5, 15) > w) return;//Occasionaly do not split up rooms so we get large rooms from time to time.
		var x = random(x1 + 4, x1 + w - 5);
		for(var y=y1; y<y1+h; y++)
			map.tiles[x][y].type = 16;
		divideRooms(x1, y1, x - x1, h);
		divideRooms(x + 1, y1, x1 + w - x - 1, h);
		
		//Search to add a door.
		while(true)
		{
			var y = random(y1+1, y1+h-1);
			if (map.tiles[x-1][y-1].type < 16 && map.tiles[x-1][y].type < 16 && map.tiles[x-1][y+1].type < 16 && map.tiles[x-1][y+2].type < 16 && map.tiles[x+1][y-1].type < 16 && map.tiles[x+1][y].type < 16 && map.tiles[x+1][y+1].type < 16 && map.tiles[x+1][y+2].type < 16)
				break;
		}
		map.tiles[x][y].type = 17;
		map.tiles[x][y+1].type = 17;
	}else{
		if (random(5, 15) > h) return;//Occasionaly do not split up rooms so we get large rooms from time to time.
		var y = random(y1 + 4, y1 + h - 5);
		for(var x=x1; x<x1+w; x++)
			map.tiles[x][y].type = 16;
		divideRooms(x1, y1, w, y - y1);
		divideRooms(x1, y + 1, w, y1 + h - y - 1);

		//Search to add a door.
		while(true)
		{
			var x = random(x1+1, x1+w-1);
			if (map.tiles[x-1][y-1].type < 16 && map.tiles[x][y-1].type < 16 && map.tiles[x+1][y-1].type < 16 && map.tiles[x+2][y-1].type < 16 && map.tiles[x-1][y+1].type < 16 && map.tiles[x][y+1].type < 16 && map.tiles[x+1][y+1].type < 16 && map.tiles[x+2][y+1].type < 16)
				break;
		}
		map.tiles[x][y].type = 17;
		map.tiles[x+1][y].type = 17;
	}
}


function buildCorridor(x, y, lastDir)
{
	var length = random(5, 20);
	var dir = random(0, 4);
	if (dir == lastDir) dir = random(0, 4);
	var dirX = [1,0,-1,0];
	var dirY = [0,1,0,-1];
	
	if (x+dirX[dir]*length < 1) length = x-1;
	if (y+dirY[dir]*length < 1) length = y-1;
	if (x+dirX[dir]*length >= map.width-2) length = map.width-x-3;
	if (y+dirY[dir]*length >= map.height-2) length = map.height-y-3;
	
	for(var n=1; n<length; n++)
	{
		if (map.tiles[x+dirX[dir]*n][y+dirY[dir]*n].groundTile == 48)
		{
			length = n;
			break;
		}
	}

	map.tiles[x][y].groundTile = 48;
	for(var n=1; n<length; n++)
	{
		map.tiles[x+dirX[dir]*n][y+dirY[dir]*n].groundTile = 48;
	}
	
	var totalLength = length;
	if (length > 2)
	{
		totalLength += buildCorridor(x+dirX[dir]*length, y+dirY[dir]*length, dir);
		totalLength += buildCorridor(x+dirX[dir]*length, y+dirY[dir]*length, dir);
	}
	return totalLength;
}
