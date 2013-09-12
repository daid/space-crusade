var gameData = {
	audioContext: null,
	canvas: null,
	canvasCtx: null,
	screenWidth: null,
	screenHeight: null,
	screenScale: null,
	tempCanvas: null,
	images: {},
}

if (typeof AudioContext != 'undefined') gameData.audioContext = new AudioContext();
else if (typeof webkitAudioContext != 'undefined')	gameData.audioContext = new webkitAudioContext();

function drawImage(sprite, x, y, sx, sy, sw, sh)
{
	var s = gameData.screenScale;
	gameData.canvasCtx.drawImage(gameData.images[sprite].image, sx * s, sy * s, sw * s, sh * s, x * s, y * s, sw * s, sh * s);
}

function drawRect(x, y, w, h, c)
{
	var s = gameData.screenScale;
	gameData.canvasCtx.fillStyle = c;
	gameData.canvasCtx.fillRect(x * s, y * s, w * s, h * s);
}

function drawLine(x0, y0, x1, y1, c)
{
	var s = gameData.screenScale;
	gameData.canvasCtx.fillStyle = c;
	
	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	if (x0 < x1) var sx = 1; else var sx = -1;
	if (y0 < y1) var sy = 1; else var sy = -1;
	
	var err = dx - dy;
	while(true)
	{
		gameData.canvasCtx.fillRect(x0 * s, y0 * s, s, s);
		if (x0 == x1 && y0 == y1) return;
		
		var e2 = 2*err;
		if (e2 > -dy)
		{
			err = err - dy;
			x0 = x0 + sx;
			if (x0 == x1 && y0 == y1)
			{
				gameData.canvasCtx.fillRect(x0 * s, y0 * s, s, s);
				return;
			}
		}
		if (e2 < dx)
		{
			err = err + dx;
			y0 = y0 + sy;
		}
	}
}

function drawBox(x, y, w, h, c)
{
	drawRect(x, y, w, 1, c);
	drawRect(x, y, 1, h, c);
	drawRect(x, y+h-1, w, 1, c);
	drawRect(x+w-1, y, 1, h, c);
}

function loadImage(name, url, preProcessType)
{
	var ret = {
		baseImage: new Image(),
		image: null,
	};
	gameData.images[name] = ret;
	ret.baseImage.onload = function() {
		if (gameData.screenScale < 2)
		{
			//No need to resize
			ret.image = ret.baseImage;
		}else{
			//Resize the image
			var s = gameData.screenScale;
			ret.image = new Image();
			if (gameData.tempCanvas == null) gameData.tempCanvas = document.createElement('canvas');
			gameData.tempCanvas.width = ret.baseImage.width * s;
			gameData.tempCanvas.height = ret.baseImage.height * s;
			var ctx = gameData.tempCanvas.getContext('2d');
			ctx.drawImage(ret.baseImage, 0, 0);
			var data = ctx.getImageData(0, 0, ret.baseImage.width * s, ret.baseImage.height * s);
			if (preProcessType == 1)
				for(var n=0; n<ret.baseImage.width*ret.baseImage.height*4*s; n+=4)
					if (data.data[n] == data.data[0] && data.data[n+1] == data.data[1] && data.data[n+2] == data.data[2])
						data.data[n+3] = 0;
			if (preProcessType == 2)
				for(var n=0; n<ret.baseImage.width*ret.baseImage.height*4*s; n+=4)
					if (data.data[n] == 0 && data.data[n+1] == 0 && data.data[n+2] == 0 && data.data[n+3] == 255)
						data.data[n+3] = 128;
			
			for(var y=ret.baseImage.height-1; y>=0; y--)
			{
				var idx0 = y * ret.baseImage.width * s;
				for(var ys=s-1; ys>=0; ys--)
				{
					var idx1 = (y * s + ys) * ret.baseImage.width * s;
					for(var x=ret.baseImage.width-1; x>=0; x--)
					{
						for(var n=0;n<s;n++)
						{
							data.data[(idx1+x*s+n)*4] = data.data[(idx0+x)*4];
							data.data[(idx1+x*s+n)*4+1] = data.data[(idx0+x)*4+1];
							data.data[(idx1+x*s+n)*4+2] = data.data[(idx0+x)*4+2];
							data.data[(idx1+x*s+n)*4+3] = data.data[(idx0+x)*4+3];
						}
					}
				}
			}
			ctx.putImageData(data, 0, 0);
			ret.image.src = gameData.tempCanvas.toDataURL();
		}
		
		for(var key in gameData.images)
		{
			if (gameData.images[key].image == null)
				return;
		}
		console.debug('Done loading');
		gameData.loadDoneCallback();
		
	};
	ret.baseImage.src = url;
	return ret;
}

function initGame(canvas, width, height, scale, loadDoneCallback)
{
	gameData.canvas = canvas;
	gameData.canvasCtx = canvas.getContext('2d');
	gameData.screenWidth = width;
	gameData.screenHeight = height;
	gameData.screenScale = scale;
	gameData.loadDoneCallback = loadDoneCallback;
	
	canvas.width = width * scale;
	canvas.height = height * scale;
}

function binaryAjaxRequest(url, callback)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// Decode asynchronously
	request.onload = function() {
		callback(request.response);
	};
	request.send();
}

function random(min, max)
{
	return min + Math.floor(Math.random() * (max - min));
}
