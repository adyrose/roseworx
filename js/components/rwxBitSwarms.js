require('../../scss/components/rwxBitSwarm.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxCanvas from '../helpers/rwxCanvasHelpers';

class rwxBitSwarms extends rwxCore {
	constructor()
	{
		super('[rwx-bit-swarm]');
	}

	execute(el, mc)
	{
		let bits = el.hasAttribute('data-rwx-bit-swarm-value');
		if(!bits){this.error('There is no value (data-rwx-bit-swarm-value) attribute detected on the rwx-bit-swarm element.'); return;}
		bits = el.getAttribute('data-rwx-bit-swarm-value');
		return new rwxBitSwarm(el, bits);
	}
}

class rwxBitSwarm extends rwxComponent {
	constructor(el, bits)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true})
		this.el = el;
		this.letters = [];
		this.bitSpacing = 40;
		this.bitSize = 60;
		this.bitColor = "white";
		this.createCanvas();
		this.sizeCanvas();
		this.split(bits.toUpperCase());
		this.startAnimation();
	}

	split(bits)
	{
		this.c.fillStyle = this.bitColor;
		const letters = [...bits];
		const notAllowed = letters.filter((l)=>!Object.keys(rwxBitSwarmLetterMatrix).includes(l));
		if(notAllowed.length > 0){this.error(`[${notAllowed}] ${notAllowed.length > 1 ? 'are not supported bits' : 'is not a supported bit'}. Supported bits are [${Object.keys(rwxBitSwarmLetterMatrix)}]. CASE INSENSITIVE.`); return;}
		
		// needs to be middle - each letter should have 40 x 40 width height ratio so should be able to calculate based on screen dimensions
		// and number of letter , also wrapping
		let bitx = 300;
		let bity = 500;

		letters.map((l, i)=>{
			this.letters.push(new rwxBitSwarmLetter(rwxBitSwarmLetterMatrix[l], bitx, bity, this.c, this.canvas));
			bitx += (this.bitSize + this.bitSpacing)
			return;
		});
	}

	createCanvas()
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.el.appendChild(this.canvas);
	}

	animate()
	{
		for(let l of this.letters)
		{
			l.update();
		}
	}

	resize()
	{
		this.sizeCanvas();
	}

	sizeCanvas()
	{
		let meas = this.el.getBoundingClientRect();
		let pixelRatio = rwxCanvas.scale(this.canvas, this.c, meas.width, meas.height);
		this.width = (this.canvas.width / pixelRatio);
		this.height = (this.canvas.height / pixelRatio);
	}
}

class rwxBitSwarmLetter {
	constructor(matrix, xpos, ypos, c, canvas)
	{
		Object.assign(this, {xpos, ypos, c, canvas});
		this.particleTimeout = 20;
		this.particleSize = 5;
		this.createParticleData(matrix);
	}

	createParticleData(mtx)
	{
		// const trailLine = { //so all particles can follow same trail on timeouts
		// 	x1:,
		// 	y1:,
		// 	x2:,
		// 	y2:
		// };
		let counter = 0;
		this.matrixParticles = [];
		mtx.map((m)=>{
			this.matrixParticles.push({
				finalx: this.xpos + m.x,
				finaly: this.ypos +  m.y,
				// startx: 
				// starty: 
				// startcp1: 
				// startcp2:
				// startcp3
				// startcp4:
				// rejigglecp1:
				// rejigglecp2;
				// rejigglecp3:
				// rejigglecp4:
				//timeout: counter*this.particleTimeout;
				//rejiggletimeout: 
			});
			counter +=1;
			return;
		});
	}

	update()
	{
		for(let p of this.matrixParticles)
		{
			this.c.beginPath();
			//this.c.arc(p.finalx, p.finaly, this.particleSize, 0, 2 * Math.PI);
			this.c.rect((p.finalx-(this.particleSize/2)), (p.finaly-(this.particleSize/2)), this.particleSize, this.particleSize);
			this.c.fill();
			this.c.closePath();

		}
		// this.c.beginPath();
		// this.c.strokeStyle = "white";
		// this.c.rect(500, 500, 40, 40);
		// this.c.stroke();
	 // 	this.c.font = '60px serif';
  // 	this.c.fillText('R', 540, 540);
	}

	draw()
	{

	}

	in()
	{

	}

	out()
	{

	}

	rejiggle()
	{

	}
}

// 60 X 60
const rwxBitSwarmLetterMatrix = {
	"R": [
		{x:0, y:0},
		{x:15, y:0},
		{x:30, y:0},
		{x:45, y:0},
		{x:60, y:0},
		{x:60, y:15},
		{x:60, y:30},
		{x:45, y:30},
		{x:30, y:30},
		{x:15, y:30},
		{x:0, y:15},
		{x:0, y:30},
		{x:0, y:45},
		{x:0, y:60},
		{x:45, y:45},
		{x:60, y:60},
	],
	"O": [
		{x:0, y:0},
		{x:15, y:0},
		{x:30, y:0},
		{x:45, y:0},
		{x:60, y:0},
		{x:60, y:15},
		{x:60, y:30},
		{x:60, y:45},
		{x:60, y:60},
		{x:45, y:60},
		{x:30, y:60},
		{x:15, y:60},
		{x:0, y:60},
		{x:0, y:45},
		{x:0, y:30},
		{x:0, y:15},
	],
	"S": [
		{x:60, y:0},
		{x:45, y:0},
		{x:30, y:0},
		{x:15, y:0},
		{x:0, y:0},
		{x:0, y:15},
		{x:0, y:30},
		{x:15, y:30},
		{x:30, y:30},
		{x:45, y:30},
		{x:60, y:30},
		{x:60, y:45},
		{x:60, y:60},
		{x:45, y:60},
		{x:30, y:60},
		{x:15, y:60},
		{x:0, y:60}
	],
	"E": [
		{x:0, y:0},
		{x:0, y:15},
		{x:0, y:30},
		{x:0, y:45},
		{x:0, y:60},
		{x:15, y:0},
		{x:30, y:0},
		{x:45, y:0},
		{x:60, y:0},
		{x:15, y:30},
		{x:30, y:30},
		{x:45, y:30},
		{x:60, y:30},
		{x:15, y:60},
		{x:30, y:60},
		{x:45, y:60},
		{x:60, y:60},
	],
	"W": [
		{x:0, y:0},
		{x:3.75, y:15},
		{x:7.5, y:30},
		{x:11.25, y:45},
		{x:15, y:60},
		{x:18.75, y:45},
		{x:22.5, y:30},
		{x:26.25, y:15},
		{x:30, y:0},
		{x:33.75, y:15},
		{x:37.5, y:30},
		{x:41.25, y:45},
		{x:45, y:60},
		{x:48.75, y:45},
		{x:52.5, y:30},
		{x:56.25, y:15},
		{x:60, y:0}
	],
	"X": [
		{x:0, y:0},
		{x:10, y:10},
		{x:20, y:20},
		{x:30, y:30},
		{x:40, y:40},
		{x:50, y:50},
		{x:60, y:60},
		{x:60, y:0},
		{x:50, y:10},
		{x:40, y:20},
		{x:20, y:40},
		{x:10, y:50},
		{x:0, y:60},
	]
}

export default new rwxBitSwarms();