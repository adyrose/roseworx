import { rwxComponent } from '../rwxCore';

import { rwxCanvas, rwxMath, rwxDOM, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import {rwxParticle} from './rwxParticle';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

import { rwxAnimation, rwxAnimationChain } from '../modules/rwxAnimation';

class rwxBitExplosions extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-explosion');
		this.spareColorDefault = "#FFFFFF";
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor)
	{
		let sparecolor = el.hasAttribute('data-rwx-bit-explosion-secondary-color') ? el.getAttribute('data-rwx-bit-explosion-secondary-color') : this.spareColorDefault;
		return new rwxBitExplosion(el, mc, bits, orientation, shape, color, bgcolor, sparecolor);
	}
}

class rwxBitExplosion extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color, bgcolor, sparecolor)
	{
		super({element: el, enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.el.style.backgroundColor = bgcolor;
		this.shape = shape;
		this.bits = bits;
		this.orientation = orientation;
		this.bitColor = color;
		this.backgroundColor = bgcolor;
		this.spareParticleColor = sparecolor;
		this.startParticlesize = 3;
		this.spareParticleSize = 1;
		this.boundaryFromWordToSpareParticle = 10;
		this.numberOfSpareParticles = 20;
		this.elFullSizeAbsolute();
		this.createCanvas();
		this.calculateLetterParticles();
		if(!this.matrix)return;
		this.calculateSpareParticles();
		this.calculateAnimationPath();
		this.createMouseParticle();
	}

	createMouseParticle()
	{
		this.mouseParticle = new rwxParticle(this.width/2, this.height/2, this.matrix[0].dimensions.bitSize, 'circle', this.backgroundColor, this.c, 2);
	}

	calculateLetterParticles()
	{
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height);
		this.wordParticles = [];
		if(!this.matrix)return;
		this.matrix.map((m)=>{
			m.matrix.map((mp)=>{
				let letterparticle = new rwxParticle(mp.x, mp.y, this.startParticlesize, this.shape, this.spareParticleColor, this.c)
				letterparticle.isLetter = true;
				letterparticle.actualparticlesize = m.dimensions.particleSize;
				this.wordParticles.push(letterparticle);
				return;
			});
			return;
		});
	}

	calculateSpareParticles()
	{
		this.spareParticles = [];
		const boundaries = [];
		const toAddToMax = this.matrix[0].dimensions.bitSize + this.boundaryFromWordToSpareParticle;
		const toMinusFromMin = this.boundaryFromWordToSpareParticle;
		this.matrix.map((m,i)=>{
			i==0 && boundaries.push({min:{x: m.bitx-toMinusFromMin, y:m.bity-toMinusFromMin}});
			if(i>0 && (m.bity > this.matrix[i-1].bity))
			{
				boundaries[boundaries.length-1].max = {x: this.matrix[i-1].bitx + toAddToMax, y: this.matrix[i-1].bity + toAddToMax};
				boundaries.push({min:{x: m.bitx-toMinusFromMin, y:m.bity-toMinusFromMin}});
			}
			if(i== this.matrix.length-1){boundaries[boundaries.length-1].max = {x: m.bitx + toAddToMax, y: m.bity + toAddToMax};}
			return;
		});

		let xIncrement = (this.width / this.numberOfSpareParticles);
		let yIncrement = (this.height / this.numberOfSpareParticles);
		let xCounter = xIncrement/2;
		let yCounter = yIncrement/2;
		for(let w=0;w<this.numberOfSpareParticles;w++)
		{
			toContinue: for(let h=0;h<this.numberOfSpareParticles;h++)
			{
				for(let b of boundaries)
				{
					if(xCounter >= b.min.x && xCounter <= b.max.x && yCounter >= b.min.y && yCounter <= b.max.y)
					{
						yCounter += yIncrement;
						continue toContinue;
					}
				}
				let pa = new rwxParticle(xCounter, yCounter, this.startParticlesize, this.shape, this.spareParticleColor, this.c);
				pa.flashAnimation = new rwxAnimationChain({
					sequence: [
						{
							from: this.startParticlesize,
							to: this.spareParticleSize,
							easing: 'easeInQuad',
							duration:1000,
							delay: rwxMath.randomInt(1000,3000)
						},
						{
							to: this.startParticlesize,
							easing: 'easeOutQuad',
							duration:1000
						}
					],
					loop:true
				});
				this.spareParticles.push(pa);
				yCounter += yIncrement;
			}
			xCounter+=xIncrement;
			yCounter = yIncrement/2;
		}
	}

	calculateAnimationPath()
	{
		this.allParticles = [...this.spareParticles, ...this.wordParticles];
		let start = {x:rwxMath.randomInt(0, this.width) , y:this.height+50};
		let center = {x:this.width/2, y:this.height/2};

		this.calculateCluster(start);

		let xbound = start.x < this.width/2 ? [0, this.width/2] : [this.width/2, this.width];
		let cpx = rwxMath.randomInt(xbound[0],xbound[1]);

		this.allParticles.map((p,i)=>{
			p.initialAnimation = new rwxAnimationChain({
				sequence: [
					{
						from:[p.cluster.x, p.cluster.y],
						control: [
							{cp1:cpx, cp2:center.x},
							{cp1:0, cp2:0}
						],
						to: [center.x, center.y],
						easing: 'easeInQuint',
						duration: 4000,
					},
					{
						to: [p.x, p.y],
						easing: 'easeOutQuad',
						duration: rwxMath.randomInt(1000,5000)
					}
				],
				complete: ()=>p.doneInit=true
			})
			if(p.isLetter)
			{
				p.flashAnimation = new rwxAnimation({
					from: this.startParticlesize,
					to: p.actualparticlesize,
					duration: 1000,
					easing: 'easeOutQuad',
					complete: ()=>p.color = this.bitColor
				})
			}
			p.final = {x: p.x, y: p.y};
			return;
		});
	}

	calculateCluster(center)
	{
		let limit = 6;
		let counter = 0;
		let clusterArr = [];
		this.allParticles.map((p,i)=>{
			if(i>0)
			{
				if(counter==limit)
				{
					limit = limit*2;
					clusterArr.push(counter);
					counter = 0;
				}
				counter+=1;
				if(i == this.allParticles.length-1)
				{
					clusterArr.push(counter);
				}
			}
			else
			{
				p.cluster = {x: center.x, y: center.y};
			}
		});

		let particleCounter = 1;
		for(let [i2, c] of clusterArr.entries())
		{
			let anglecounter = 0;
			let angle = 360 / c;
			for(let i=0;i<c;i++)
			{
				let particle = this.allParticles[particleCounter];
				let coords = rwxGeometry.getCoordinatesFromAngle(center, rwxGeometry.toRadians(anglecounter), particle.radius*4*(i2+1));
				particle.cluster = {x: coords.x, y: coords.y};
				anglecounter+=angle;
				particleCounter +=1;
			}
		}
	}

	scrolledIntoView()
	{
		if(this.allParticles.length == 0){
			this.stopAnimation = true;
			return;
		}		
		this.startAnimation();
		this.stopScroll();
	}

	animate()
	{
		this.allParticles.map((p, i)=>{
			if(!p.doneInit)
			{
				p.initialAnimation.animate([
					(x,y)=>p.refresh(x,y),
					(x,y)=>p.refresh(x,y)
				])
			}
			else
			{
				let toPass = p.isLetter ? (r)=>p.setRadius(r) : [(r)=>p.setRadius(r),(r)=>p.setRadius(r)];
				p.flashAnimation.animate(toPass);
				let coords;
				if(rwxGeometry.isInsideCircle(p.final, this.mouseTrack.mouse, this.matrix[0].dimensions.bitSize))
				{
					coords = rwxGeometry.closestPointOnCircumference(p.final, this.mouseTrack.mouse, this.matrix[0].dimensions.bitSize);
				}
				else
				{
					coords = p.final;
				}
				p.refresh(coords.x, coords.y);
			}
			p.draw();
			return;
		});
	}

	resize()
	{
		this.sizeCanvas();
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height);
		let counter = 0;
		this.matrix.map((m)=>{
			m.matrix.map((mp)=>{
				this.wordParticles[counter].x = mp.x;
				this.wordParticles[counter].y = mp.y;
				this.wordParticles[counter].final = {x: mp.x, y:mp.y};
				this.wordParticles[counter].setRadius(m.dimensions.particleSize);
				counter+=1;
				return;
			});
			return;
		});
		this.calculateSpareParticles();
		this.allParticles = [...this.spareParticles, ...this.wordParticles];
		this.allParticles.map((p)=>{p.final={x:p.x,y:p.y};p.doneInit=true;});
	}
}

export default new rwxBitExplosions();