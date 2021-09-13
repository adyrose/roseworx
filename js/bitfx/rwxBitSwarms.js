import { rwxComponent } from '../rwxCore';

import { rwxMath, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import {rwxParticle} from './rwxParticle';
import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

import { rwxAnimation, rwxAnimationChain } from '../modules/rwxAnimation';

class rwxBitSwarms extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-swarm', false, false, 'rwxBitSwarms');
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor, nofill)
	{
		return new rwxBitSwarm(el, mc, bits, orientation, shape, color, bgcolor, nofill);
	}
}

class rwxBitSwarm extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color, bgcolor, nofill)
	{
		super({element: el, enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true});
		this.shape = shape;
		this.orientation = orientation;
		this.backgroundColor = bgcolor;
		this.bitColor = color;
		this.nofill = nofill;
		this.repeatAnimations = true;
		this.letters = [];
		this.animationsStarted = [];
		this.letterAnimationTimeout = 20;
		this.letterTimeoutTicker = 0;
		this.letterTimeoutTicker2 = 0;
		this.wordAnimationTimeout = 300;
		this.wordAnimationTicker = 0;
		this.elFullSizeAbsolute(bgcolor);
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
		this.stopScroll();
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
				this.letters.push(new rwxBitSwarmLetter(l.matrix, l.bitx, l.bity, l.dimensions.bitSize, l.dimensions.particleSize, this.bitColor, this.shape, this.c, this.canvas, this.width, this.height, `${this.uniqueID}letter${i}`, this.nofill));
			}
			else
			{
				this.letters[i].matrix = l.matrix;
				this.letters[i].bitSize = l.dimensions.bitSize;
				this.letters[i].boundary = this.letters[i].bitSize;
				this.letters[i].particleSize = l.dimensions.particleSize;
				this.letters[i].xpos = l.bitx;
				this.letters[i].ypos = l.bity;
				this.letters[i].width = this.width;
				this.letters[i].height = this.height;
				this.letters[i].createParticleData();				
			}
		});
	}

	moused()
	{
		if(this.mouseParticle)
		{
			this.mouseParticle.velocity = this.mouseTrack.velocity;
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
		this.mouseParticle.update(this.mouseTrack.mouse.x, this.mouseTrack.mouse.y);
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
	constructor(matrix, xpos, ypos, bitSize, particleSize, bitColor, shape, c, canvas, width, height, uniqueID, nofill)
	{
		Object.assign(this, {matrix, xpos, ypos, bitSize, particleSize, bitColor, shape, c, canvas, width, height, uniqueID, nofill});
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

	getcyclone(i)
	{
		return {
			distancefromcenter: this.matrixParticles[i].distancefromcenter,
			cyclonedistancefromcenter: this.matrixParticles[i].cyclonedistancefromcenter,
		}
	}

	getcurrentx(i)
	{
		return this.matrixParticles[i].currentx;
	}

	getcurrenty(i)
	{
		return this.matrixParticles[i].currenty;
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
			let cycloneangle = rwxGeometry.getAngle({x:centerx, y:centery}, {x:m.x, y:m.y});
			let droptopx = (this.xpos + (this.bitSize/2));
			let droptopy = (this.ypos - this.boundary);
			let dropbottomx = (this.xpos + (this.bitSize/2));
			let dropbottomy = (this.ypos + this.bitSize);
			let particle = new rwxParticle(m.x, m.y, this.particleSize, this.shape, this.bitColor, this.c, 1);
			if(this.nofill)
			{
				particle.setFill(false);
				particle.setStroke(true)
			}
			this.matrixParticles.push({
				finalx: m.x,
				finaly: m.y,
				cycloneangle,
				centerx,
				centery,
				timeout: i*this.particleTimeout,
				startAnimation: new rwxAnimation({
					from: [this.randomPositionInBoundary('x'), this.randomPositionInBoundary('y')],
					control:[
						{cp1:rwxMath.randomInt(0, this.width), cp2:this.xpos},
						{cp1:rwxMath.randomInt(0, this.height), cp2:this.ypos}
					],
					to: [m.x, m.y],
					duration: this.startDuration,
					easing: 'easeOutQuart',
					complete: ()=>this.particleAnimationCount.push(i)
				}),
				rejiggleAnimation: new rwxAnimation({
					from:[()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
					control:[
						{cp1:this.randomPositionInBoundary('x'), cp2: this.randomPositionInBoundary('x')},
						{cp1:this.randomPositionInBoundary('x'), cp2: this.randomPositionInBoundary('y')}
					],
					to: [m.x, m.y],
					easing: 'easeInOutQuad',
					duration: this.rejiggleDuration,
					complete: ()=>this.particleAnimationCount.push(i)
				}),
				swarmAnimation: new rwxAnimationChain(
					{
						sequence: [
							{
								from:[()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
								control: [
									{cp1:rwxMath.randomInt(0, this.width), cp2:this.xpos},
									{cp1: rwxMath.randomInt(0, this.height), cp2:this.ypos}
								],
								to:[rwxMath.randomInt(0, this.width), rwxMath.randomInt(0, this.height)],
								duration:this.swarmDuration/2,
								easing:'easeInOutQuart'
							},
							{
								control: [
									{cp1:rwxMath.randomInt(0, this.width), cp2:this.xpos},
									{cp1: rwxMath.randomInt(0, this.height), cp2:this.ypos}
								],
								to:[m.x, m.y],
								duration: this.swarmDuration/2,
								easing: 'easeInOutQuart'
							}
						],
						complete: ()=>this.particleAnimationCount.push(i)
					}
				),
				snakeAnimation: new rwxAnimationChain(
					{
						sequence: [
							{
								from:[()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
								to: [snakestartx, snakestarty],
								easing: 'easeInQuart',
								duration: this.snakeDuration/3
							},
							{
								control: [
									{cp1:snakecpx, cp2:snakecp2x},
									{cp1:snakecpy, cp2:snakecp2y}
								],
								to: [m.x, m.y],
								easing: 'linear',
								duration: this.snakeDuration
							}
						],
						complete: ()=>this.particleAnimationCount.push(i)
					}
				),
				fireworxAnimation: new rwxAnimationChain(
					{
						sequence: [
							{
								from:[()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
								to:[droptopx, (this.ypos + this.boundary + this.bitSize)],
								duration: ((this.fireworxDuration/5)*3),
								easing: 'easeOutCubic'
							},
							{
								to: [centerx, centery],
								easing: 'easeInQuint',
								duration: (this.fireworxDuration/5)
							},
							{
								to:[m.x, m.y],
								duration: (this.fireworxDuration/5),
								easing: 'easeOutQuint'
							}
						],
						complete: ()=>this.particleAnimationCount.push(i)
					},
				),
				dropAnimation: new rwxAnimationChain(
					{
						sequence: [
							{
								from:[()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
								to:[droptopx, droptopy],
								easing: 'linear',
								duration: ((this.dropDuration/5)*3)
							},
							{
								to: [dropbottomx, dropbottomy],
								easing: 'easeInQuint',
								duration: (this.dropDuration/5)
							},
							{
								to: [m.x, m.y],
								easing: 'easeOutQuint',
								duration: (this.dropDuration/5)
							}
						],
						complete: ()=>this.particleAnimationCount.push(i)
					}
				),
				cycloneAnimation: new rwxAnimation(
					{
						from: ()=>this.getcyclone(i).distancefromcenter,
						to: ()=>(this.getcyclone(i).cyclonedistancefromcenter*2),
						easing: 'easeOutCubic',
						duration: this.cycloneDuration,
						complete: ()=>this.particleAnimationCount.push(i)
					}
				),
				explodeAnimation: new rwxAnimationChain(
					{
						sequence: [
							{
								from: [()=>{return this.getcurrentx(i)}, ()=>{return this.getcurrenty(i)}],
								to: [centerx, centery],
								easing: 'easeOutCubic',
								duration: this.explodeDuration/3
							},
							{
								to: [explodepoint.x, explodepoint.y],
								easing: 'easeOutQuint',
								duration: this.explodeDuration/2
							},
							{
								to: [m.x, m.y],
								easing: 'easeInCubic',
								duration: this.explodeDuration
							}
						],
						complete: ()=>this.particleAnimationCount.push(i)
					}
				),
				particle
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
					if(this.startAnimation && this.particleTimeoutTicker >= p.timeout){
						this.start(p);
					}
					else if(this.cycloneAnimation && this.particleTimeoutTicker >= p.timeout){
						this.cyclone(p);
					}
					else if(this.snakeAnimation && this.particleTimeoutTicker >= p.timeout) {
						this.snake(p);
					}
					else if(this.explodeAnimation){
						this.explode(p);
					}
					else if(this.rejiggleAnimation && this.particleTimeoutTicker >= p.timeout) {
						this.rejiggle(p);
					}
					else if(this.dropAnimation) {
						this.drop(p);
					}
					else if(this.fireworxAnimation) {
						this.fireworx(p);
					}
					else if(this.swarmAnimation) {
						this.swarm(p);
					}
					else if(this.particleTimeoutTicker < p.timeout && !this.startAnimation)
					{
						this.normal(p);
						continue;
					}
					else{
						continue;
					}
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
		this.animations.map((a)=>this[`${a}Animation`]=false);
		this.matrixParticles.map((m)=>{
			m.fireworxAnimation.reset();
			m.dropAnimation.reset();
			m.cycloneAnimation.reset();
			m.explodeAnimation.reset();
			m.startAnimation.reset();
			m.snakeAnimation.reset();
			m.rejiggleAnimation.reset();
			m.swarmAnimation.reset();
		});
		this.particleTimeoutTicker = 0;
		this.particleAnimationCount = [];
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

	fireworx(p)
	{
		p.fireworxAnimation.animate([
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y)
		]);
		p.particle.draw();
	}

	drop(p)
	{
		p.dropAnimation.animate([
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y)
		]);
		p.particle.draw();
	}

	cyclone(p)
	{
		p.cycloneAnimation.animate((val)=>{
			if(p.cycloneAnimation.getEasingValue()>=0.5)
			{
				val = p.finaldistancefromcenter + (p.cyclonedistancefromcenter - (val-p.cyclonedistancefromcenter));
			}
			let x = p.centerx + Math.cos(rwxGeometry.toRadians((0 + (1080 - 0) * p.cycloneAnimation.getEasingValue())+p.cycloneangle)) * val;
			let y = p.centery + Math.sin(rwxGeometry.toRadians((0 + (1080 - 0) * p.cycloneAnimation.getEasingValue())+p.cycloneangle)) * val;
			p.particle.refresh(x,y);	
		});
		p.particle.draw();
	}

	start(p)
	{
		p.startAnimation.animate(
			(x, y)=>p.particle.refresh(x,y)
		);
		p.particle.draw();
	}

	swarm(p, i)
	{
		p.swarmAnimation.animate([
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y)
		]);
		p.particle.draw();
	}

	explode(p)
	{
		p.explodeAnimation.animate([
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y)
		]);
		p.particle.draw();
	}

	snake(p)
	{
		p.snakeAnimation.animate([
			(x, y)=>p.particle.refresh(x,y),
			(x, y)=>p.particle.refresh(x,y)
		]);
		p.particle.draw();	
	}

	rejiggle(p)
	{
		p.rejiggleAnimation.animate((x, y)=>p.particle.refresh(x,y));
		p.particle.draw();	
	}
}

export default new rwxBitSwarms();