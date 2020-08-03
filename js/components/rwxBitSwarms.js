require('../../scss/components/rwxBitSwarm.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxGeometry from '../helpers/rwxGeometryHelpers';

import {rwxParticle, rwxParticleShapes} from '../common/rwxParticle';
import rwxBitFontGetMatrix from '../common/rwxBitFont';

/*
	add collision detection functionality for when the mouse hits
	add more effects and improve current ones
*/


class rwxBitSwarms extends rwxCore {
	constructor()
	{
		super('[rwx-bit-swarm]', true);
		this.shapeDefault = 'circle';
		this.colorDefault = '#FFFFFF';
	}

	execute(el, mc)
	{
		let bits = el.hasAttribute('data-rwx-bit-swarm-value');
		if(!bits){this.error('There is no value (data-rwx-bit-swarm-value) attribute detected on the rwx-bit-swarm element.'); return;}
		bits = el.getAttribute('data-rwx-bit-swarm-value');
		let orientation = el.hasAttribute('data-rwx-bit-swarm-orientation') ? el.getAttribute('data-rwx-bit-swarm-orientation') : this.orientationDefault;
		let shape = el.hasAttribute('data-rwx-bit-swarm-shape') ? el.getAttribute('data-rwx-bit-swarm-shape') : this.shapeDefault;
		let color = el.hasAttribute('data-rwx-bit-swarm-color') ? el.getAttribute('data-rwx-bit-swarm-color') : this.colorDefault;
		if(!rwxParticleShapes.includes(shape)){this.error(`${shape} is not a valid shape. Valid shapes include ['${rwxParticleShapes.join("', '")}']. Using '${this.shapeDefault}'.`); shape = this.shapeDefault;}
		return new rwxBitSwarm(el, mc, bits, orientation, shape, color);
	}
}

class rwxBitSwarm extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.el = el;
		this.shape = shape;
		this.orientation = orientation;
		this.bitColor = color;
		this.letters = [];
		this.animationsStarted = [];
		this.letterAnimationTimeout = 20;
		this.letterTimeoutTicker = 0;
		this.letterTimeoutTicker2 = 0;
		this.wordAnimationTimeout = 300;
		this.wordAnimationTicker = 0;
		this.createCanvas();
		this.calculatePosition(true, bits);
	}

	scrolledIntoView()
	{
		this.startAnimation();
	}

	calculatePosition(firstblood=false, bits)
	{
		let letters = rwxBitFontGetMatrix(bits, this.orientation, this.width, this.height);
		if(firstblood){this.actualLetters = bits}
		letters.map((l,i)=>{
			if(firstblood)
			{
				this.letters.push(new rwxBitSwarmLetter(l.matrix, l.bitx, l.bity, l.dimensions.bitSize, l.dimensions.particleSize, l.dimensions.particleGap, this.shape, this.c, this.canvas, this.width, this.height, `letter${i}`));
			}
			else
			{
				this.letters[i].matrix = l.matrix;
				this.letters[i].bitSize = l.dimensions.bitSize;
				this.letters[i].boundary = this.letters[i].bitSize;
				this.letters[i].particleSize = l.dimensions.particleSize;
				this.letters[i].particleGap = l.dimensions.particleGap;
				this.letters[i].xpos = l.bitx;
				this.letters[i].ypos = l.bity;
				this.letters[i].createParticleData();				
			}
		});
	}

	createCanvas()
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.el.appendChild(this.canvas);
    this.sizeCanvas();
	}

	sizeCanvas()
	{
		let meas = this.el.getBoundingClientRect();
		let pixelRatio = rwxCanvas.scale(this.canvas, this.c, meas.width, meas.height);
		this.width = (this.canvas.width / pixelRatio);
		this.height = (this.canvas.height / pixelRatio);
		this.c.fillStyle = this.bitColor;
	}

	moused()
	{

	}

	animate()
	{
		for(let [i,l] of this.letters.entries())
		{
			if(this.letterTimeoutTicker >= i*this.letterAnimationTimeout)
			{
				if(this.letterTimeoutTicker2 >= i*this.letterAnimationTimeout && this.setNextAnimation && !l.isAnimating() && !this.animationsStarted.includes(i))
				{
					l.startAnimating(this.nextAnimation);
					this.animationsStarted.push(i);
				}
				l.update();
			}
			if(l.animationDone && i==this.letters.length-1 && !this.startWordAnimationTicker)
			{
				this.setNextAnimation = false;
				this.startWordAnimationTicker = true;
				this.startletterTimeoutTicker2 = false;
			}
		}

		if(this.letterTimeoutTicker < this.letters.length*this.letterAnimationTimeout)
		{
			this.letterTimeoutTicker +=1;
		}
		if(this.startWordAnimationTicker)
		{
			this.wordAnimationTicker +=1;
			if(this.wordAnimationTicker >= this.wordAnimationTimeout){
				this.nextAnimation = this.letters[0].animations[rwxMath.randomInt(1, this.letters[0].animations.length-1)];
				this.setNextAnimation = true;
				this.wordAnimationTicker = 0;
				this.letterTimeoutTicker2 = 0;
				this.startletterTimeoutTicker2 = true;
				this.animationsStarted = [];
			}
		}

		if(this.startletterTimeoutTicker2 && this.letterTimeoutTicker2 < this.letters.length*this.letterAnimationTimeout)
		{
			this.letterTimeoutTicker2 += 1;
		}
		else{
			this.startWordAnimationTicker = false;
		}
	}

	resize()
	{
		this.sizeCanvas();
		this.calculatePosition(false, this.actualLetters);
	}
}

class rwxBitSwarmLetter {
	constructor(matrix, xpos, ypos, bitSize, particleSize, particleGap, shape, c, canvas, width, height, uniqueID)
	{
		Object.assign(this, {matrix, xpos, ypos, bitSize, particleSize, particleGap, shape, c, canvas, width, height, uniqueID});
		this.particleTimeout = 5;
		this.particleTimeoutTicker = 0;
		this.startDuration = 4000;
		this.rotateDuration = 5000;
		this.explodeDuration = 1500;
		this.snakeDuration = 3000;
		this.rejiggleDuration = 3000;
		this.dropDuration = 5000;
		this.fireworxDuration = 5000;
		this.waveDuration = 5000;
		this.boundary = this.bitSize;
		this.createParticleData();
		this.particleAnimationCount = [];
		this.particleAnimationCount2 = [];
		this.particleAnimationCount3 = [];
		this.animations = ['start', 'rotate', 'explode', 'snake', 'rejiggle', 'drop', 'fireworx'];
		this.startAnimating('start');
	}

	startAnimating(type)
	{
		this.animationDone = false;
		this[`${type}Animation`] = true;
	}

	randomPositionInBoundary(xory)
	{
		let toUse = xory == "x" ? this.xpos : this.ypos;
		return rwxMath.randomInt((toUse-this.boundary), (toUse+this.bitSize+this.boundary));
	}

	createParticleData()
	{
		this.matrixParticles = [];

		const snakestartx = this.randomPositionInBoundary('x');
		const snakestarty = this.randomPositionInBoundary('y');
		const snakecpx = this.randomPositionInBoundary('x');
		const snakecpy = this.randomPositionInBoundary('y');
		const snakecp2x = this.randomPositionInBoundary('x');
		const snakecp2y = this.randomPositionInBoundary('y');

		this.matrix.map((m, i)=>{
			let centerx = this.xpos + (this.bitSize/2);
			let centery = this.ypos + (this.bitSize/2);
			let explodepoint = rwxGeometry.closestPointOnCircumference({x: m.x, y:m.y}, {x:centerx, y:centery}, this.boundary);
			let distancefromcenter = rwxGeometry.getDistance({x:centerx, y:centery},{x:m.x, y:m.y});
			let rotatedistancefromcenter = distancefromcenter + this.bitSize/2;
			let rotateangle = rwxGeometry.getAngle(centerx, centery, m.x, m.y);
			this.matrixParticles.push({
				finalx: m.x,
				finaly: m.y,
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
				droptopx: (this.xpos + (this.bitSize/2)),
				droptopy: (this.ypos - this.boundary),
				dropbottomx: (this.xpos + (this.bitSize/2)),
				dropbottomy: (this.ypos + this.bitSize),
				fireworxbottomx: (this.xpos + (this.bitSize/2)),
				fireworxbottomy: (this.ypos + this.boundary + this.bitSize),
				distancefromcenter,
				rotatedistancefromcenter,
				rotateangle,
				explodepointx: explodepoint.x,
				explodepointy: explodepoint.y,
				centerx,
				centery,
				timeout: i*this.particleTimeout,
				particle: new rwxParticle(m.x, m.y, this.particleSize, this.shape, this.c)
			});
			return;
		});
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
					if(this.startAnimation && this.particleTimeoutTicker >= p.timeout){
						vals = this.start(p,i)
					}
					else if(this.rotateAnimation && this.particleTimeoutTicker >= p.timeout){
						vals = this.rotate(p,i);
					}
					else if(this.snakeAnimation && this.particleTimeoutTicker >= p.timeout) {
						vals = this.snake(p,i);
					}
					else if(this.explodeAnimation){
						vals = this.explode(p,i);
					}
					else if(this.rejiggleAnimation && this.particleTimeoutTicker >= p.timeout) {
						vals = this.rejiggle(p,i);
					}
					else if(this.dropAnimation) {
						vals = this.drop(p,i);
					}
					else if(this.fireworxAnimation) {
						vals = this.fireworx(p,i);
					}
					else if(this.particleTimeoutTicker < p.timeout && !this.startAnimation)
					{
						this.normal(p);
						continue;
					}
					else{
						continue;
					}
					p.particle.update(vals.x, vals.y);
				}
				else
				{
					this.normal(p);
				}
				if(this.particleAnimationCount.length == this.matrixParticles.length)
				{
					this.animationDone = true;
					this.resetAnimations();
				}
			}
			else
			{
				this.normal(p)
			}
		}

		if(this.isAnimating())
		{
			this.particleTimeoutTicker +=1;
		}
	}

	resetAnimations()
	{
		this.animations.map((a)=>this[`${a}Animation`]=false)
		this.particleTimeoutTicker = 0;
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
		p.particle.update(p.finalx, p.finaly);
	}

	fireworx(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlefireworx${i}`, 'easeOutCubic', (this.fireworxDuration/5)*3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.finalx, p.fireworxbottomx, val);
			let y = rwxAnimate.fromToCalc(p.finaly, p.fireworxbottomy, val);
			return {x,y};
		}
		else
		{
			return this.fireworxStep2(p, i);
		}
	}

	fireworxStep2(p, i)
	{
		if(!this.particleAnimationCount3.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlefireworx2${i}`, 'easeInQuint', (this.fireworxDuration/5), ()=>{this.particleAnimationCount3.push(i);})
			let x = rwxAnimate.fromToCalc(p.fireworxbottomx, p.centerx, val);
			let y = rwxAnimate.fromToCalc(p.fireworxbottomy, p.centery, val);
			return {x,y};
		}
		else
		{
			return this.fireworxStep3(p, i);
		}
	}

	fireworxStep3(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlefireworx3${i}`, 'easeOutQuint', (this.fireworxDuration/5), ()=>{this.particleAnimationCount.push(i);})
		let x = rwxAnimate.fromToCalc(p.centerx, p.finalx, val);
		let y = rwxAnimate.fromToCalc(p.centery, p.finaly, val);
		return {x,y};
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

export default new rwxBitSwarms();