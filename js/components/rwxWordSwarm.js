//import { rwxCanvasHelpers } from 'roseworx';

class WordSwarm {
	constructor(canvasid, width, height, word)
	{
		const canvas = document.getElementById(canvas);
		if(!canvas){throw new error(`Cant find element ${canvasid} - RWX WordSwarm`) return;}
		const c = canvas.getContext('2d');
		const letters = [...word];
		rwx.rwxCanvasHelpers.scaleCanvas();
	}

	calculatePoints(letter)
	{

	}
}

class WordSwarmLetter {
	constructor()
	{

	}
}