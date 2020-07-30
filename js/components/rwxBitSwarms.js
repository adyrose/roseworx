require('../../scss/components/rwxBitSwarm.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxGeometry from '../helpers/rwxGeometryHelpers';

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
		this.letterTimeoutStart = 20;
		this.timeoutCounter = 0;
		this.shape = "square";
		this.sizes = {
			'sm': {
				particleSize: 2,
				particleGap: 5,
				bitSize: 20,
				bitSpacing: 10
			},
			'md': {
				particleSize: 4,
				particleGap: 10,
				bitSize: 40,
				bitSpacing: 25
			},
			'lg': {
				particleSize: 6,
				particleGap: 15,
				bitSize: 60,
				bitSpacing: 40
			},
			'xl': {
				particleSize: 8,
				particleGap: 20,
				bitSize: 80,
				bitSpacing: 55
			}
		}
		this.bitColor = "white";
		this.createCanvas();
		this.sizeCanvas();
		this.calculateSize();
		this.split(bits.toUpperCase());
		this.startAnimation();
	}

	split(bits)
	{
		const letters = [...bits];
		const notAllowed = letters.filter((l)=>!Object.keys(rwxBitSwarmLetterMatrix).includes(l));
		if(notAllowed.length > 0){this.error(`[${notAllowed}] ${notAllowed.length > 1 ? 'are not supported bits' : 'is not a supported bit'}. Supported bits are [${Object.keys(rwxBitSwarmLetterMatrix)}]. CASE INSENSITIVE.`); return;}
		const center = this.calculateCenter(letters.length);
		let bitx = center.x;
		letters.map((l, i)=>{
			this.letters.push(new rwxBitSwarmLetter(rwxBitSwarmLetterMatrix[l], bitx, center.y, this.size.bitSize, this.size.particleSize, this.size.particleGap, this.shape, this.c, this.canvas, this.width, this.height, `letter${i}`));
			bitx += (this.size.bitSize + this.size.bitSpacing);
			return;
		});
	}

	calculateCenter(bitlength)
	{
		let x = (this.width/2) - (((bitlength*this.size.bitSize) + ((bitlength-1)*this.size.bitSpacing))/2) ;
		let y = (this.height/2) - (this.size.bitSize/2);
		return {x, y};
	}

	createCanvas()
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.el.appendChild(this.canvas);
	}

	animate()
	{
		for(let [i,l] of this.letters.entries())
		{
			if(this.timeoutCounter >= i*this.letterTimeoutStart)
			{
				l.update();
			}
		}
		if(this.timeoutCounter < this.letters.length*this.letterTimeoutStart)
		{
			this.timeoutCounter +=1;
		}
	}

	calculateSize()
	{
		if(this.width <= 500)
		{
			this.size = this.sizes.sm;
		}
		else if(this.width > 500 && this.width <= 750)
		{
			this.size = this.sizes.md;
		}
		else if(this.width > 750 && this.width <= 1000)
		{
			this.size = this.sizes.lg;
		}
		else if(this.width > 1000)
		{
			this.size = this.sizes.xl;
		}
	}

	resize()
	{
		this.sizeCanvas();
		this.calculateSize();
		const center = this.calculateCenter(this.letters.length);
		let bitx = center.x;
		for(let l of this.letters)
		{
			l.particleSize = this.size.particleSize;
			l.particleGap = this.size.particleGap;
			l.xpos = bitx;
			l.ypos = center.y;
			l.resizeUpdate();
			bitx += (this.size.bitSize + this.size.bitSpacing);
		}		
	}

	sizeCanvas()
	{
		let meas = this.el.getBoundingClientRect();
		let pixelRatio = rwxCanvas.scale(this.canvas, this.c, meas.width, meas.height);
		this.width = (this.canvas.width / pixelRatio);
		this.height = (this.canvas.height / pixelRatio);
		this.c.fillStyle = this.bitColor;
	}
}

class rwxBitSwarmLetter {
	constructor(matrix, xpos, ypos, bitSize, particleSize, particleGap, shape, c, canvas, width, height, uniqueID)
	{
		Object.assign(this, {matrix, xpos, ypos, bitSize, particleSize, particleGap, shape, c, canvas, width, height, uniqueID});
		this.particleTimeout = 5;
		this.animationTimer = 0;
		this.animationTimeoutTimer = 0;
		this.startDuration = 4000;
		this.rotateDuration = 5000;
		this.explodeDuration = 1500;
		this.snakeDuration = 3000;
		this.rejiggleDuration = 3000;
		this.dropDuration = 5000;
		this.waveDuration = 5000;
		this.boundary = this.bitSize*2;
		this.createParticleData();
		this.particleAnimationCount = [];
		this.particleAnimationCount2 = [];
		this.particleAnimationCount3 = [];
		this.animations = ['start', 'rotate', 'explode', 'snake', 'rejiggle', 'drop'];
		this.waveAnimation = true;
		// this.dropAnimation = true;
		//this.startAnimation = true;
		//this.rotateAnimation = true;
		//this.explodeAnimation = true;
		//this.snakeAnimation = true;
		//this.rejiggleAnimation = true;
	}

	resizeUpdate()
	{
		this.matrix.map((m,i)=>{
			this.matrixParticles[i].finalx = this.xpos + (m.x * this.particleGap);
			this.matrixParticles[i].finaly = this.ypos + (m.y * this.particleGap);
		});
	}

	randomPositionInBoundary(xory)
	{
		let toUse = xory == "x" ? this.xpos : this.ypos;
		return rwxMath.randomInt((toUse-this.boundary), (toUse+this.bitSize+this.boundary));
	}

	createParticleData()
	{
		this.matrixParticles = [];
		// do here so all particles have same
		const snakestartx = this.randomPositionInBoundary('x');
		const snakestarty = this.randomPositionInBoundary('y');
		const snakecpx = this.randomPositionInBoundary('x');
		const snakecpy = this.randomPositionInBoundary('y');
		const snakecp2x = this.randomPositionInBoundary('x');
		const snakecp2y = this.randomPositionInBoundary('y');

		this.matrix.map((m, i)=>{
			let finalx = this.xpos + (m.x * this.particleGap);
			let finaly = this.ypos + (m.y * this.particleGap);
			let centerx = this.xpos + (this.bitSize/2);
			let centery = this.ypos + (this.bitSize/2);
			let explodepoint = rwxGeometry.closestPointOnCircumference({x: finalx, y:finaly}, {x:centerx, y:centery}, this.boundary);
			let distancefromcenter = rwxGeometry.getDistance({x:centerx, y:centery},{x:finalx, y:finaly});
			let rotatedistancefromcenter = distancefromcenter + this.bitSize;
			let rotateangle = rwxGeometry.getAngle(centerx, centery, finalx, finaly);
			this.matrixParticles.push({
				finalx,
				finaly,
				startx: this.randomPositionInBoundary('x'),
				starty: this.randomPositionInBoundary('y'),
				startcpx: rwxMath.randomInt(0, this.width),//rwxMath.randomInt(0, this.width) //rwxMath.randomInt((this.xpos - (this.bitSize/20)), (this.xpos+this.bitSize+(this.bitSize/20))),
				startcpy: rwxMath.randomInt(0, this.height),//rwxMath.randomInt(0, this.height) //rwxMath.randomInt((this.ypos - (this.bitSize/20)), (this.ypos+this.bitSize+(this.bitSize/20))),
				startcp2x: this.xpos,//rwxMath.randomInt((this.xpos - (this.bitSize/20)), (this.xpos+this.bitSize+(this.bitSize/20))),
				startcp2y: this.ypos,//rwxMath.randomInt((this.ypos - (this.bitSize/20)), (this.ypos+this.bitSize+(this.bitSize/20))),
				rejigglecpx: this.randomPositionInBoundary('x'),
				rejigglecpy: this.randomPositionInBoundary('y'),
				rejigglecp2x: this.randomPositionInBoundary('x'),
				rejigglecp2y: this.randomPositionInBoundary('y'),
				snakestartx,
				snakestarty,
				snakecpx,
				snakecpy,
				snakecp2x,
				snakecp2y,
				//elastic - widening and shrinking radius from current angle 
				// All join together into "psringy box" either per lettter or whole thing
				// Have some sort of natural state? rotating or floating
				// Hve them ping away from mouse on mousemove
				droptopx: (this.xpos + (this.bitSize/2)),
				droptopy: (this.ypos - this.boundary),
				dropbottomx: (this.xpos + (this.bitSize/2)),
				dropbottomy: (this.ypos + this.bitSize),
				distancefromcenter,
				rotatedistancefromcenter,
				rotateangle,
				explodepointx: explodepoint.x,
				explodepointy: explodepoint.y,
				centerx,
				centery,
				timeout: i*this.particleTimeout
			});
			return;
		});
	}

	draw(x, y)
	{
			this.c.beginPath();
			if(this.shape == "square")
			{
				this.c.rect((x-(this.particleSize/2)), (y-(this.particleSize/2)), this.particleSize, this.particleSize);
			}
			else if (this.shape == "circle")
			{
				this.c.arc(x, y, this.particleSize/2, 0, 2 * Math.PI);
			}
			this.c.fill();
			this.c.closePath();

	}

	update()
	{
		for(let [i, p] of this.matrixParticles.entries())
		{
			if(this.isAnimating())
			{
				if(!this.particleAnimationCount.includes(i))
				{
					let vals;
					if(this.startAnimation && this.animationTimer >= p.timeout){
						vals = this.start(p,i)
					}
					else if(this.rotateAnimation && this.animationTimer >= p.timeout){
						vals = this.rotate(p,i);
					}
					else if(this.snakeAnimation && this.animationTimer >= p.timeout) {
						vals = this.snake(p,i);
					}
					else if(this.explodeAnimation){
						vals = this.explode(p,i);
					}
					else if(this.rejiggleAnimation && this.animationTimer >= p.timeout) {
						vals = this.rejiggle(p,i);
					}
					else if(this.dropAnimation) {
						vals = this.drop(p,i);
					}
					else if(this.animationTimer < p.timeout && !this.startAnimation)
					{
						this.normal(p);
						continue;
					}
					else{
						continue;
					}
					this.draw(vals.x, vals.y);
				}
				else
				{
					this.normal(p);
				}
				if(this.particleAnimationCount.length == this.matrixParticles.length)
				{
					this.resetAnimations();
					this.newAnimation();
				}
			}
			else
			{
				this.normal(p)
			}
		}

		if(this.isAnimating())
		{
			this.animationTimer +=1;
		}
		else
		{
			this.animationTimeoutTimer +=1;
			if(this.animationTimeoutTimer >= this.animationTimeout)
			{
				this[`${this.nextAnimation}Animation`] = true;
			}
		}
	}

	newAnimation()
	{
		this.animationTimeout = rwxMath.randomInt((60*2),(60*10));
		this.nextAnimation = this.animations[rwxMath.randomInt(1, this.animations.length-1)];
	}

	resetAnimations()
	{
		this.animations.map((a)=>this[`${a}Animation`]=false)
		this.animationTimer = 0;
		this.animationTimeoutTimer = 0;
		this.particleAnimationCount = [];
		this.particleAnimationCount2 = [];
		this.particleAnimationCount3 = [];
	}

	isAnimating()
	{
		let isAnimating = false;
		this.animations.map((a)=>{if(!isAnimating){isAnimating = this[`${a}Animation`]}return;})
		return isAnimating;
	}

	normal(p)
	{
		this.draw(p.finalx, p.finaly);
	}

	wave(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlewave${i}`, 'easeInQuart', (this.waveDuration/5), ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.finalx, p.wavestartx, val);
			let y = rwxAnimate.fromToCalc(p.finaly, p.wavestarty, val);
			return {x,y};
		}
		else
		{
			return this.waveStep2(p, i);
		}
	}

	waveStep2(p, i)
	{
		if(!this.particleAnimationCount3.includes(i))
		{
			return rwxAnimate.fromToBezier({ x: p.wavestartx, y: p.wavestarty }, { x: p.wavestartx, y: p.wavey }, { x: p.wavestartx, y: p.wavey }, { x: p.wavestartx, y: p.wavestarty }, `${this.uniqueID}particlewave2${i}`, 'easeOutQuart', (this.waveDuration/5)*3, () => {this.particleAnimationCount3.push(i);});
		}
		else
		{
			return this.waveStep3(p, i);
		}
	}

	waveStep3(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlewave3${i}`, 'easeOutQuart', (this.waveDuration/5), ()=>{this.particleAnimationCount.push(i);})
		let x = rwxAnimate.fromToCalc(p.wavestartx, p.finalx, val);
		let y = rwxAnimate.fromToCalc(p.wavestarty, p.finaly, val);
		return {x,y};		
	}

	drop(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particledrop${i}`, 'linear', (this.dropDuration/5)*3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.finalx, p.droptopx, val);
			let y = rwxAnimate.fromToCalc(p.finaly, p.droptopy, val);
			return {x,y};
		}
		else
		{
			return this.dropStep2(p, i);
		}
	}

	dropStep2(p, i)
	{
		if(!this.particleAnimationCount3.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particledrop2${i}`, 'easeInQuint', (this.dropDuration/5), ()=>{this.particleAnimationCount3.push(i);})
			let x = rwxAnimate.fromToCalc(p.droptopx, p.dropbottomx, val);
			let y = rwxAnimate.fromToCalc(p.droptopy, p.dropbottomy, val);
			return {x,y};
		}
		else
		{
			return this.dropStep3(p, i);
		}
	}

	dropStep3(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particledrop3${i}`, 'easeOutQuint', (this.dropDuration/5), ()=>{this.particleAnimationCount.push(i);})
		let x = rwxAnimate.fromToCalc(p.dropbottomx, p.finalx, val);
		let y = rwxAnimate.fromToCalc(p.dropbottomy, p.finaly, val);
		return {x,y};
	}

	rotate(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlerotate${i}`, 'easeOutCubic', this.rotateDuration, ()=>{this.particleAnimationCount.push(i);});
		let d = rwxAnimate.fromToCalc(p.distancefromcenter, p.rotatedistancefromcenter*2, val);
		if(val>=0.5)
		{
			d = p.distancefromcenter + (p.rotatedistancefromcenter - (d-p.rotatedistancefromcenter));
		}
		let x = p.centerx + Math.cos(rwxGeometry.toRadians(rwxAnimate.fromToCalc(0, 1080, val)+p.rotateangle)) * d;
		let y = p.centery + Math.sin(rwxGeometry.toRadians(rwxAnimate.fromToCalc(0, 1080, val)+p.rotateangle)) * d;
		return {x,y};
	}

	start(p, i)
	{
		return rwxAnimate.fromToBezier({ x: p.startx, y: p.starty }, { x: p.startcpx, y: p.startcpy }, { x: p.startcp2x, y: p.startcp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particlestart${i}`, 'easeOutQuart', this.startDuration, () => {this.particleAnimationCount.push(i);});	
	}

	explode(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particleexplode${i}`, 'easeOutQuint', this.explodeDuration/2, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.finalx, p.explodepointx, val);
			let y = rwxAnimate.fromToCalc(p.finaly, p.explodepointy, val);
			return {x,y};
		}
		else
		{
			return this.implode(p, i);
		}
	}

	implode(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particleimplode${i}`, 'easeInCubic', this.explodeDuration, ()=>{this.particleAnimationCount.push(i);})
		let x = rwxAnimate.fromToCalc(p.explodepointx, p.finalx, val);
		let y = rwxAnimate.fromToCalc(p.explodepointy, p.finaly, val);
		return {x,y};
	}

	snake(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlesnake${i}`, 'easeInQuart', this.snakeDuration/3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.finalx, p.snakestartx, val);
			let y = rwxAnimate.fromToCalc(p.finaly, p.snakestarty, val);
			return {x,y};
		}
		else
		{
			return this.snakeStep2(p, i);
		}		
	}

	snakeStep2(p, i)
	{
		return rwxAnimate.fromToBezier({ x: p.snakestartx, y: p.snakestarty }, { x: p.snakecpx, y: p.snakecpy }, { x: p.snakecp2x, y: p.snakecp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particlesnake2${i}`, 'linear', this.snakeDuration, () => {this.particleAnimationCount.push(i);});
	}

	rejiggle(p, i)
	{
		return rwxAnimate.fromToBezier({ x: p.finalx, y: p.finaly }, { x: p.rejigglecpx, y: p.rejigglecpy }, { x: p.rejigglecp2x, y: p.rejigglecp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particlerejiggle${i}`, 'easeInOutQuad', this.rejiggleDuration, () => {this.particleAnimationCount.push(i);});	
	}
}

const rwxBitSwarmLetterMatrix = {
	"R": [
		{x:0, y:0},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:4, y:1},
		{x:4, y:2},
		{x:3, y:2},
		{x:2, y:2},
		{x:1, y:2},
		{x:0, y:1},
		{x:0, y:2},
		{x:0, y:3},
		{x:0, y:4},
		{x:3, y:3},
		{x:4, y:4},
	],
	"O": [
		{x:0, y:0},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:4, y:1},
		{x:4, y:2},
		{x:4, y:3},
		{x:4, y:4},
		{x:3, y:4},
		{x:2, y:4},
		{x:1, y:4},
		{x:0, y:4},
		{x:0, y:3},
		{x:0, y:2},
		{x:0, y:1},
	],
	"S": [
		{x:4, y:0},
		{x:3, y:0},
		{x:2, y:0},
		{x:1, y:0},
		{x:0, y:0},
		{x:0, y:1},
		{x:0, y:2},
		{x:1, y:2},
		{x:2, y:2},
		{x:3, y:2},
		{x:4, y:2},
		{x:4, y:3},
		{x:4, y:4},
		{x:3, y:4},
		{x:2, y:4},
		{x:1, y:4},
		{x:0, y:4}
	],
	"E": [
		{x:0, y:0},
		{x:0, y:1},
		{x:0, y:2},
		{x:0, y:3},
		{x:0, y:4},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:1, y:2},
		{x:2, y:2},
		{x:3, y:2},
		{x:4, y:2},
		{x:1, y:4},
		{x:2, y:4},
		{x:3, y:4},
		{x:4, y:4},
	],
	"W": [
		{x:0, y:0},
		{x:0.25, y:1},
		{x:0.5, y:2},
		{x:0.75, y:3},
		{x:1, y:4},
		{x:1.25, y:3},
		{x:1.5, y:2},
		{x:1.75, y:1},
		{x:2, y:0},
		{x:2.25, y:1},
		{x:2.5, y:2},
		{x:2.75, y:3},
		{x:3, y:4},
		{x:3.25, y:3},
		{x:3.5, y:2},
		{x:3.75, y:1},
		{x:4, y:0}
	],
	"X": [
		{x:0, y:0},
		{x:0.66, y:0.66},
		{x:1.32, y:1.32},
		{x:2, y:2},
		{x:2.66, y:2.66},
		{x:3.32, y:3.32},
		{x:4, y:4},
		{x:4, y:0},
		{x:3.32, y:0.66},
		{x:2.66, y:1.32},
		{x:1.32, y:2.66},
		{x:0.66, y:3.32},
		{x:0, y:4},
	]
}

export default new rwxBitSwarms();