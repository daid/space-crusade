var map = {
	tiles: new Array(),
	width: 40,
	height: 40,
	viewX: 0,
	viewY: 0,
};

function drawMap()
{
	if (map.viewX < 0) map.viewX = 0;
	if (map.viewY < 0) map.viewY = 0;
	if (map.viewX > map.width-20) map.viewX = map.width-20;
	if (map.viewY > map.height-20) map.viewY = map.height-20;
	for(var x=0;x<map.width;x++)
		for(var y=0;y<map.height;y++)
			if (map.tiles[x][y].vis == 2)
				map.tiles[x][y].vis = 1;
	for(var n in unitList)
	{
		var unit = unitList[n];
		if (unit.isFriendly())
			castLight(unit.x, unit.y, 21, function(x, y) { map.tiles[x][y].vis = 2; });
	}
	//Draw floor
	for(var x=0;x<20;x++)
	{
		for(var y=0;y<20;y++)
		{
			var t = map.tiles[x+map.viewX][y+map.viewY];
			drawTile(x, y, t.groundTile);
			
			if (t.type == 8 && map.tiles[x+map.viewX][y+map.viewY-1].type == 8)
			{
				drawTile(x, y-1, 2);
				drawTile(x, y, 2);
			}
			if (y+map.viewY > 0 && map.tiles[x+map.viewX][y+map.viewY-1].type == 8 && map.tiles[x+map.viewX-1][y+map.viewY-1].type == 8)
			{
				drawTile(x-1, y, 1);
				drawTile(x, y, 1);
			}
			if (t.blood)
				drawSprite(x, y, 50);
		}
	}
	//Draw walls and units.
	for(var x=0;x<20;x++)
	{
		for(var y=0;y<20;y++)
		{
			if (map.tiles[x+map.viewX][y+map.viewY].unit)
				map.tiles[x+map.viewX][y+map.viewY].unit.draw();
			if (map.tiles[x+map.viewX][y+map.viewY].vis == 0)
				continue;
			var u = y+map.viewY > 0 && map.tiles[x+map.viewX][y+map.viewY-1].type >= 16 && map.tiles[x+map.viewX][y+map.viewY-1].vis > 0;
			var d = y+map.viewY < map.height - 1 && map.tiles[x+map.viewX][y+map.viewY+1].type >= 16 && map.tiles[x+map.viewX][y+map.viewY+1].vis > 0;
			var l = x+map.viewX > 0 && map.tiles[x+map.viewX-1][y+map.viewY].type >= 16 && map.tiles[x+map.viewX-1][y+map.viewY].vis > 0;
			var r = x+map.viewX < map.width - 1 && map.tiles[x+map.viewX+1][y+map.viewY].type >= 16 && map.tiles[x+map.viewX+1][y+map.viewY].vis > 0;
			var dl = x+map.viewX > 0 && y+map.viewY < map.height - 1 && map.tiles[x+map.viewX-1][y+map.viewY+1].type >= 16 && map.tiles[x+map.viewX-1][y+map.viewY+1].vis > 0;
			if (map.tiles[x+map.viewX][y+map.viewY].type == 16)
			{
				if (l && u && !r && !d)
					drawWall(x, y, 2);
				else if (!l && u && r && !d)
					drawWall(x, y, 3);
				else if (l && !r && d)
					drawWall(x, y, 18);
				else if (!l && r && d)
					drawWall(x, y, 19);
				else if (l && r && d)
					drawWall(x, y, 4);
				else if ((u && d) | d)
				{
					drawWall(x, y, 1);
					if (d && map.tiles[x+map.viewX][y+map.viewY+1].type == 17)
						drawWall(x, y, 34);
				}else if (u && !l && !r)
					drawWall(x, y, 17);
				else if (!r)
					drawWall(x, y, 16);
				else
					drawWall(x, y, 0);

				if (l && dl)//Add part of the shadow of the corner of the tile left of this one.
					drawWall(x, y, 20);
			}else if (map.tiles[x+map.viewX][y+map.viewY].type == 17)
			{
				if (u || d)
					drawWall(x, y, 33);
				else
					drawWall(x, y, 32);
			}
		}
	}
	
	//Draw attack visuals
	for(var n=0; n<visualList.length;n ++)
	{
		var v = visualList[n];
		drawLine((v.x0-map.viewX) * 16 + 8, 32+(v.y0-map.viewY) * 16 + 8, (v.x1-map.viewX) * 16 + 8, 32+(v.y1-map.viewY) * 16 + 8, "rgba(255,0,0,0.5)");
		drawSprite(v.x1-map.viewX, v.y1-map.viewY, 49);
	}
	
	//Draw fog of war.
	for(var x=0;x<20;x++)
	{
		for(var y=0;y<20;y++)
		{
			if (map.tiles[x+map.viewX][y+map.viewY].vis == 0)
				drawRect(x*16, 32+y*16, 16, 16, "rgba(0,0,0,1.0)");
			else if (map.tiles[x+map.viewX][y+map.viewY].vis == 1)
				drawRect(x*16, 32+y*16, 16, 16, "rgba(0,0,0,0.7)");
		}
	}
	if (selection)
		drawBox((selection.x - map.viewX) * 16-1, (selection.y - map.viewY) * 16+32-2,18,20, "rgba(255,255,0,0.5)");
	
	drawBox(0,32,20*16,20*16, "#ffffff");
	drawRect(0,0, 480, 32, "#101010");
	drawRect(20*16,0, 160, 352, "#101010");

	drawBox(20*16+2,350-map.height,map.width+2,map.height+2, "#ffffff");
	for(var x=0;x<map.width;x++)
	{
		for(var y=0;y<map.height;y++)
		{
			var c = "#000000";
			var t = map.tiles[x][y];
			if (t.vis == 1)
			{
				if (t.type == 16)
					c = "#808080";
				else if (t.type == 17)
					c = "#A0A000";
			}else if (t.vis == 2)
			{
				c = "#404040";
				if (t.unit && t.unit.isEnemy())
					c = "#f00000";
				else if (t.unit && t.unit.isFriendly())
					c = "#00f000";
				else if (t.type == 16)
					c = "#AAAAAA";
				else if (t.type == 17)
					c = "#FFFF00";
				else if (t.type == 8)
					c = "#808000";
			}
			drawRect(20*16+3+x,351-map.height+y, 1, 1, c);
		}
	}
	drawBox(20*16+3+map.viewX,351-map.height+map.viewY,20,20, "rgba(0,255,0,0.3)");
}
