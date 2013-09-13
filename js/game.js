var player = null;
var selection = null;

$().ready(function () {
	initGame($('#mainCanvas')[0], 480, 352, 2, function() {
		generateMap();
		player = new Unit(0, 50, 50);
		new Unit(1, 51, 50);
		new Unit(1, 50, 51);
		new Unit(1, 51, 51);
		updateActQueue();
		addMessage("Welcome!");
		//addMessage("Type ? for help.");

		map.viewX = player.x - 10;
		map.viewY = player.y - 10;

		drawScreen();
	});
	loadImage('tiles', 'images/tiles.png', 1);
	loadImage('walls', 'images/walls.png', 2);
	loadImage('sprites', 'images/sprites.png', 1);
	loadImage('font', 'images/font.png', 1);
	
	$('#mainCanvas').on('click', function(e) {
		var x = e.pageX - $('#mainCanvas').offset().left;
		var y = e.pageY - $('#mainCanvas').offset().top;
		x = Math.floor(x / gameData.screenScale);
		y = Math.floor(y / gameData.screenScale);
		if (x < 20 * 16 && y > 32)
			gameState.clickMap(Math.floor((x) / 16) + map.viewX, Math.floor((y - 32) / 16) + map.viewY);
	});
	$(document).keydown(function(e) {
		console.debug('Key:' + e.keyCode);
		gameState.key(e.keyCode);
	});
});

var gameStateNormal = {
	clickMap: function(x, y)
	{
		selection = map.tiles[x][y].unit;
		drawScreen();
	},
	key: function(keyCode)
	{
		if (actQueue == player)
		{
			if (keyCode == 37) { prePlayerAction(); player.move(player.x - 1, player.y); map.viewX = player.x - 10; map.viewY = player.y - 10; }
			if (keyCode == 38) { prePlayerAction(); player.move(player.x, player.y - 1); map.viewX = player.x - 10; map.viewY = player.y - 10; }
			if (keyCode == 39) { prePlayerAction(); player.move(player.x + 1, player.y); map.viewX = player.x - 10; map.viewY = player.y - 10; }
			if (keyCode == 40) { prePlayerAction(); player.move(player.x, player.y + 1); map.viewX = player.x - 10; map.viewY = player.y - 10; }
			if (keyCode == 70)
			{
				addMessage('Select target...');
				prePlayerAction();
				gameState = gameStateTarget;
				gameState.target = {x: player.x, y: player.y}
				castLight(player.x, player.y, 10, function(x, y) {
					if (map.tiles[x][y].unit && map.tiles[x][y].unit.isEnemy())
					{
						gameState.target.x = x;
						gameState.target.y = y;
					}
				});
			}
			if (keyCode == 190 || keyCode == 46) { prePlayerAction(); insertIntoActQueue(player, 1); }
		}
		updateActQueue();
		drawScreen();
	},
	draw: function()
	{
		//Draw selected unit info.
		var u = selection;
		if (u != null && map.tiles[u.x][u.y].vis < 2) u = null;
		if (u == null) u = player;
		var nr = u.type.sprite;
		drawImage('sprites', 20*16 + 2 + 2, 32 + 2, (nr & 0x0F) * 17 + 2, (nr >> 4) * 20, 17, 18);
		drawString(20*16 + 2 + 2, 32 + 2 + 20, u.type.name);
		drawString(20*16 + 2 + 2, 32 + 2 + 27, 'Health: ' + u.hp);
	},
};
var gameStateTarget = {
	clickMap: function(x, y)
	{
	},
	key: function(keyCode)
	{
		if (keyCode == 70)
		{
			prePlayerAction();
			player.attack(gameState.target.x, gameState.target.y);
			gameState = gameStateNormal;
			updateActQueue();
		}
		if (keyCode == 37) { gameState.target.x -= 1; }
		if (keyCode == 38) { gameState.target.y -= 1; }
		if (keyCode == 39) { gameState.target.x += 1; }
		if (keyCode == 40) { gameState.target.y += 1; }
		if (keyCode == 27) { gameState = gameStateNormal; addMessage('Canceled.'); }
		drawScreen();
	},
	draw: function()
	{
		drawBox((gameState.target.x - map.viewX) * 16-1, (gameState.target.y - map.viewY) * 16+32-2,18,20, "rgba(255,255,0,0.5)");

		var u = map.tiles[gameState.target.x][gameState.target.y].unit;
		if (u == null || map.tiles[gameState.target.x][gameState.target.y].vis < 2) return;
		
		var nr = u.type.sprite;
		drawImage('sprites', 20*16 + 2 + 2, 32 + 2, (nr & 0x0F) * 17 + 2, (nr >> 4) * 20, 17, 18);
		drawString(20*16 + 2 + 2, 32 + 2 + 20, u.type.name);
		drawString(20*16 + 2 + 2, 32 + 2 + 27, 'Health: ' + u.hp);
	},
};
var gameState = gameStateNormal;

function prePlayerAction()
{
	visualList = new Array();
	selection = null;
	map.viewX = player.x - 10;
	map.viewY = player.y - 10;
}

var messageList = new Array();
function drawScreen()
{
	drawMap();
	
	//Message box
	drawBox(0, 1, 20*16, 30, "#ffffff");
	if (messageList.length > 0) drawString(2, 24, messageList[0]);
	if (messageList.length > 1) drawString(2, 17, messageList[1]);
	if (messageList.length > 2) drawString(2, 10, messageList[2]);
	if (messageList.length > 3) drawString(2, 3, messageList[3]);

	drawBox(20*16 + 2, 32, 122, 100, "#ffffff");
	gameState.draw();
}
function addMessage(message)
{
	messageList.unshift(message);
}

var visualList = new Array();
function addShotVisual(x0, y0, x1, y1)
{
	visualList.push({x0: x0, y0: y0, x1: x1, y1: y1});
}

function drawTile(x, y, nr)
{
	drawImage('tiles', x*16, 32+y*16, (nr & 0x0F) * 16, (nr >> 4) * 16, 16, 16);
}
function drawWall(x, y, nr)
{
	drawImage('walls', x*16, 32+y*16, (nr & 0x0F) * 32, (nr >> 4) * 32, 32, 32);
}
function drawSprite(x, y, nr)
{
	drawImage('sprites', x*16, 32+y*16-2, (nr & 0x0F) * 17 + 2, (nr >> 4) * 20, 17, 18);
}
function drawHealth(x, y, value, max)
{
	drawRect(x*16, 32+y*16-2, 16, 4, "rgba(0, 0, 0, 0.7)");
	drawRect(x*16+1, 32+y*16-2+1, 14*value/max, 2, "rgba(0, 255, 0, 0.5)");
}

function drawString(x, y, str)
{
	for(var n=0; n<str.length; n++)
	{
		var c = str.charCodeAt(n);
		if (c >= 65 && c < 65+27)
			drawImage('font', x, y, (c - 65) * 9, 7, 8, 6);
		else if (c >= 65+32 && c < 65+32+27)
			drawImage('font', x, y, (c - 65 - 32) * 9, 7, 8, 6);
		else if (c >= 49 && c < 49+9)
			drawImage('font', x, y, (c - 49) * 9, 14, 8, 6);
		else if (c == 48)//0
			drawImage('font', x, y, 81, 14, 8, 6);
		else if (c == 58)//:
			drawImage('font', x, y, 16*9+6, 14, 8, 6);
		else if (c == 46)//.
			drawImage('font', x, y, 17*9+6, 14, 8, 6);
		else if (c == 44)//,
			drawImage('font', x, y, 18*9+6, 14, 8, 6);
		else if (c == 33)//!
			drawImage('font', x, y, 90, 14, 8, 6);
		else if (c == 63)//?
			drawImage('font', x, y, 99, 14, 8, 6);
		else if (c == 45)//-
			drawImage('font', x, y, 24*9, 14, 8, 6);
		else if (c == 95)//_
			drawImage('font', x, y, 7*9, 21, 8, 6);
		else if (c == 36)//$
			drawImage('font', x, y, 10*9, 21, 8, 6);
		else if (c == 32)//' '
			{}
		else
			console.debug(c);
		x += 9;
	}
}
