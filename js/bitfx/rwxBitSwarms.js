import { rwxComponent } from '../rwxCore';

import { rwxCanvas, rwxMath, rwxAnimate, rwxDOM, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import {rwxParticle} from './rwxParticle';
import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

class rwxBitSwarms extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-swarm');
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor)
	{
		return new rwxBitSwarm(el, mc, bits, orientation, shape, color, bgcolor);
	}
}

class rwxBitSwarm extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color, bgcolor)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.el = el;
		this.uniqueID = rwxMisc.uniqueId();
		this.el.style.backgroundColor = bgcolor;
		this.shape = shape;
		this.orientation = orientation;
		this.backgroundColor = bgcolor;
		this.bitColor = color;
		this.repeatAnimations = true;
		this.letters = [];
		this.animationsStarted = [];
		this.letterAnimationTimeout = 20;
		this.letterTimeoutTicker = 0;
		this.letterTimeoutTicker2 = 0;
		this.wordAnimationTimeout = 300;
		this.wordAnimationTicker = 0;
		this.elFullSizeAbsolute();
		this.createCanvas();
		this.calculatePosition(true, bits);
	}

	scrolledIntoView()
	{
		if(this.letters.length == 0){
			this.stopAnimation = true;
			return;
		}
		this.startAnimation();
		this.stopScroll = true;
	}

	calculatePosition(firstblood=false, bits)
	{
		let letters = rwxBitFontGetMatrix(bits, this.orientation, this.width, this.height);
		if(!letters)return;
		if(firstblood){
			this.actualLetters = bits;
			this.mouseParticle = new rwxParticle(this.width/2, this.height/2, letters[0].dimensions.bitSize, 'circle', this.backgroundColor, this.c, 2);
		}
		else
		{
			this.mouseParticle.setRadius(letters[0].dimensions.bitSize);
		}

		letters.map((l,i)=>{
			if(firstblood)
			{
				this.letters.push(new rwxBitSwarmLetter(l.matrix, l.bitx, l.bity, l.dimensions.bitSize, l.dimensions.particleSize, this.bitColor, this.shape, this.c, this.canvas, this.width, this.height, `${this.uniqueID}letter${i}`));
			}
			else
			{
				this.letters[i].matrix = l.matrix;
				this.letters[i].bitSize = l.dimensions.bitSize;
				this.letters[i].boundary = this.letters[i].bitSize;
				this.letters[i].particleSize = l.dimensions.particleSize;
				this.letters[i].xpos = l.bitx;
				this.letters[i].ypos = l.bity;
				this.letters[i].createParticleData();				
			}
		});
	}

	moused()
	{
		if(this.mouseParticle)
		{
			this.mouseParticle.velocity = {x: ((this.mouse.x - this.lastmouse.x)/2), y: ((this.mouse.y - this.lastmouse.y)/2)}
		}
	}

	collide(l)
	{
		for(let p of l.matrixParticles)
		{
			rwxGeometry.resolveCollision(p.particle, this.mouseParticle, true);
			p.particle.x += p.particle.velocity.x;
			p.particle.y += p.particle.velocity.y;
			p.particle.draw();
		}
	}

	animate()
	{
		this.mouseParticle.update(this.mouse.x, this.mouse.y);
		for(let [i,l] of this.letters.entries())
		{
			if(this.letterTimeoutTicker >= i*this.letterAnimationTimeout)
			{
				if(this.letterTimeoutTicker2 >= i*this.letterAnimationTimeout && this.setNextAnimation && !l.isAnimating() && !this.animationsStarted.includes(i))
				{
					l.startAnimating(this.nextAnimation);
					this.animationsStarted.push(i);
				}
				if(l.animationDone)
				{
					this.collide(l);
				}
				else
				{
					l.update();
				}
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
		if(this.repeatAnimations)
		{
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
	}

	resize()
	{
		this.sizeCanvas();
		this.calculatePosition(false, this.actualLetters);
	}
}

class rwxBitSwarmLetter {
	constructor(matrix, xpos, ypos, bitSize, particleSize, bitColor, shape, c, canvas, width, height, uniqueID)
	{
		Object.assign(this, {matrix, xpos, ypos, bitSize, particleSize, bitColor, shape, c, canvas, width, height, uniqueID});
		this.particleTimeout = 5;
		this.particleTimeoutTicker = 0;
		this.startDuration = 4000;
		this.swarmDuration = 6000;
		this.cycloneDuration = 5000;
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
		this.animations = ['start', 'cyclone', 'explode', 'snake', 'rejiggle', 'drop', 'fireworx', 'swarm'];
		this.startAnimating('start');
	}

	startAnimating(type)
	{
		this.animationDone = false;
		this[`${type}Animation`] = true;
		this.matrixParticles.map((mp)=>{
			mp.currentx = mp.particle.x;
			mp.currenty = mp.particle.y;
			mp.distancefromcenter = rwxGeometry.getDistance({x:mp.centerx, y:mp.centery},{x:mp.currentx, y:mp.currenty});
			mp.cyclonedistancefromcenter = mp.distancefromcenter + this.bitSize/2;
			mp.finaldistancefromcenter = rwxGeometry.getDistance({x:mp.centerx, y:mp.centery},{x:mp.finalx, y:mp.finaly});
			mp.particle.velocity = {x:0,y:0};
		return})
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
			if(isNaN(explodepoint.x) && isNaN(explodepoint.y)){explodepoint =  rwxGeometry.closestPointOnCircumference({x: m.x+10, y:m.y-10}, {x:centerx, y:centery}, this.boundary);}
			let cycloneangle = rwxGeometry.getAngle(centerx, centery, m.x, m.y);
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
				swarmx: rwxMath.randomInt(0, this.width),
				swarmy: rwxMath.randomInt(0, this.height),
				droptopx: (this.xpos + (this.bitSize/2)),
				droptopy: (this.ypos - this.boundary),
				dropbottomx: (this.xpos + (this.bitSize/2)),
				dropbottomy: (this.ypos + this.bitSize),
				fireworxbottomx: (this.xpos + (this.bitSize/2)),
				fireworxbottomy: (this.ypos + this.boundary + this.bitSize),
				cycloneangle,
				explodepointx: explodepoint.x,
				explodepointy: explodepoint.y,
				centerx,
				centery,
				timeout: i*this.particleTimeout,
				particle: new rwxParticle(m.x, m.y, this.particleSize, this.shape, this.bitColor, this.c, 1)
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
					else if(this.cycloneAnimation && this.particleTimeoutTicker >= p.timeout){
						vals = this.cyclone(p,i);
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
					else if(this.swarmAnimation) {
						vals = this.swarm(p,i);
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
		p.particle.draw();
	}

	fireworx(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlefireworx${i}`, 'easeOutCubic', (this.fireworxDuration/5)*3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.currentx, p.fireworxbottomx, val);
			let y = rwxAnimate.fromToCalc(p.currenty, p.fireworxbottomy, val);
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

	drop(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particledrop${i}`, 'linear', (this.dropDuration/5)*3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.currentx, p.droptopx, val);
			let y = rwxAnimate.fromToCalc(p.currenty, p.droptopy, val);
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

	cyclone(p, i)
	{
		let val = rwxAnimate.getEasingValue(`${this.uniqueID}particlecyclone${i}`, 'easeOutCubic', this.cycloneDuration, ()=>{this.particleAnimationCount.push(i);});
		let d = rwxAnimate.fromToCalc(p.distancefromcenter, p.cyclonedistancefromcenter*2, val);
		if(val>=0.5)
		{
			d = p.finaldistancefromcenter + (p.cyclonedistancefromcenter - (d-p.cyclonedistancefromcenter));
		}
		let x = p.centerx + Math.cos(rwxGeometry.toRadians(rwxAnimate.fromToCalc(0, 1080, val)+p.cycloneangle)) * d;
		let y = p.centery + Math.sin(rwxGeometry.toRadians(rwxAnimate.fromToCalc(0, 1080, val)+p.cycloneangle)) * d;
		return {x,y};
	}

	start(p, i)
	{
		return rwxAnimate.fromToBezier({ x: p.startx, y: p.starty }, { x: p.startcpx, y: p.startcpy }, { x: p.startcp2x, y: p.startcp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particlestart${i}`, 'easeOutQuart', this.startDuration, () => {this.particleAnimationCount.push(i);});	
	}

	swarm(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			return rwxAnimate.fromToBezier({ x: p.currentx, y: p.currenty }, { x: p.startcpx, y: p.startcpy }, { x: p.startcp2x, y: p.startcp2y }, { x: p.swarmx, y: p.swarmy }, `${this.uniqueID}particleSwarm1${i}`, 'easeInOutQuart', this.swarmDuration/2, () => {this.particleAnimationCount2.push(i);});	
		}
		else
		{
			return rwxAnimate.fromToBezier({ x: p.swarmx, y: p.swarmy }, { x: p.startcpx, y: p.startcpy }, { x: p.startcp2x, y: p.startcp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particleSwarm2${i}`, 'easeInOutQuart', this.swarmDuration/2, () => {this.particleAnimationCount.push(i);});	
		}
	}

	explode(p, i)
	{
		if(!this.particleAnimationCount2.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particleexplodetocenter${i}`, 'easeOutCubic', this.explodeDuration/3, ()=>{this.particleAnimationCount2.push(i);})
			let x = rwxAnimate.fromToCalc(p.currentx, p.centerx, val);
			let y = rwxAnimate.fromToCalc(p.currenty, p.centery, val);
			return {x,y};
		}
		else
		{
			return this.explodeStep2(p, i);
		}
	}

	explodeStep2(p, i)
	{
		if(!this.particleAnimationCount3.includes(i))
		{
			let val = rwxAnimate.getEasingValue(`${this.uniqueID}particleexplode${i}`, 'easeOutQuint', this.explodeDuration/2, ()=>{this.particleAnimationCount3.push(i);})
			let x = rwxAnimate.fromToCalc(p.centerx, p.explodepointx, val);
			let y = rwxAnimate.fromToCalc(p.centery, p.explodepointy, val);
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
			let x = rwxAnimate.fromToCalc(p.currentx, p.snakestartx, val);
			let y = rwxAnimate.fromToCalc(p.currenty, p.snakestarty, val);
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
		return rwxAnimate.fromToBezier({ x: p.currentx, y: p.currenty }, { x: p.rejigglecpx, y: p.rejigglecpy }, { x: p.rejigglecp2x, y: p.rejigglecp2y }, { x: p.finalx, y: p.finaly }, `${this.uniqueID}particlerejiggle${i}`, 'easeInOutQuad', this.rejiggleDuration, () => {this.particleAnimationCount.push(i);});	
	}
}

export default new rwxBitSwarms();