require('../../scss/components/rwxBitExplosion.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxGeometry from '../helpers/rwxGeometryHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';

import {rwxParticle, rwxParticleShapes} from '../common/rwxParticle';

import rwxBitFontGetMatrix from '../common/rwxBitFont';

class rwxBitExplosions extends rwxCore {
	constructor()
	{
		super('[rwx-bit-explosion]', true);
		this.shapes = ['circle', 'square'];
		this.shapeDefault = 'circle';
		this.colorDefault = '#FFFFFF';
	}

	execute(el, mc)
	{
		let bits = el.hasAttribute('data-rwx-bit-explosion-value');
		if(!bits){this.error('There is no value (data-rwx-bit-explosion-value) attribute detected on the rwx-bit-explosion element.'); return;}
		bits = el.getAttribute('data-rwx-bit-explosion-value');
		if(!bits){this.error('There is no value in the (data-rwx-bit-explosion-value) attribute.'); return;}
		let orientation = el.hasAttribute('data-rwx-bit-explosion-orientation') ? el.getAttribute('data-rwx-bit-explosion-orientation') : this.orientationDefault;
		let shape = el.hasAttribute('data-rwx-bit-explosion-shape') ? el.getAttribute('data-rwx-bit-explosion-shape') : this.shapeDefault;
		let color = el.hasAttribute('data-rwx-bit-explosion-color') ? el.getAttribute('data-rwx-bit-explosion-color') : this.colorDefault;
		if(!rwxParticleShapes.includes(shape)){this.error(`${shape} is not a valid shape. Valid shapes include ['${rwxParticleShapes.join("', '")}']. Using '${this.shapeDefault}'.`); shape = this.shapeDefault;}
		return new rwxBitExplosion(el, mc, bits, orientation, shape, color);
	}
}

class rwxBitExplosion extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.el = el;
		this.shape = shape;
		this.bits = bits;
		this.boundaryFromWordToSpareParticle = 10;
		this.orientation = orientation;
		this.bitColor = color;
		this.spareParticleColor = 'white';
		this.spareParticleSize = 1;
		this.letterParticles = [];
		this.createCanvas();
		this.numberOfSpareParticles = 3;
		this.calculateLetterParticles();
		this.calculateSpareParticles();
		this.calculateAnimationPath();
		this.createMouseParticle();
	}

	createMouseParticle()
	{
		this.mouseParticle = new rwxParticle(this.width/2, this.height/2, this.matrix[0].dimensions.bitSize, 'circle', 'red', this.c, 2);
	}

	calculateLetterParticles()
	{
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height);
		this.wordParticles = [];
		if(!this.matrix)return;
		this.matrix.map((m)=>{
			m.matrix.map((mp)=>{
				let letterparticle = new rwxParticle(mp.x, mp.y, this.spareParticleSize, this.shape, this.spareParticleColor, this.c)
				letterparticle.isLetter = true;
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
				this.spareParticles.push(new rwxParticle(xCounter, yCounter, this.spareParticleSize, this.shape, this.spareParticleColor, this.c));
				yCounter += yIncrement;
			}
			xCounter+=xIncrement;
			yCounter = yIncrement/2;
		}
	}

	calculateAnimationPath()
	{
		const allParticles = [...this.spareParticles, ...this.wordParticles];
		let start = {x:rwxMath.randomInt(0, this.width) , y:this.height+10};
		let center = {x:this.width/2, y:this.height/2};

		let xbound = start.x < this.width/2 ? [0, this.width/2] : [this.width/2, this.width];
		let cp1 = {x:rwxMath.randomInt(xbound[0],xbound[1]), y:0};
		let cp2 = {x:center.x, y:0};
		//create cluster
		let counter = 6;
		let prev;
		allParticles.map((p,i)=>{
			// if(i==0)
			// {
			// 	p.cluster = {x: center.x, y: center.y};
			// }
			// else
			// {
			// 	p.cluster = {}
			// }
			// if(i==counter)
			// {
			// 	counter = counter*2;
			// }
			// console.log(counter);

			// p.animationStep = 0;
			// p.animationPath = [];
			// return;
			p.animationPath = [{from:{x:start.x, y:start.y}, to:{x:center.x, y:center.y}, cp1, cp2, duration:5000, easing:'easeInQuint'}];
			p.animationPath.push({from:{x:center.x, y:center.y}, to:{x:p.x, y:p.y}, duration:rwxMath.randomInt(1000,5000), easing:'easeOutQuart'});
			p.animationStep = 0;
			return;
		});

		this.allParticles = allParticles;
	}

	calculateCenterPosition()
	{
		return {x:this.width/2, y:this.height/2};
	}

	scrolledIntoView()
	{
		if(this.wordParticles.length == 0){
			this.stopAnimation = true;
			return;
		}		
		this.startAnimation();
		this.stopScroll = true;
	}

	moused()
	{
		if(this.mouseParticle)
		{
			this.mouseParticle.velocity = {x: ((this.mouse.x - this.lastmouse.x)/2), y: ((this.mouse.y - this.lastmouse.y)/2)}
		}
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
	}

	animate()
	{
		this.allParticles.map((p, i)=>{
			if(p.animationPath.length > p.animationStep)
			{
				p.dont = false;
				let particle = p.animationPath[p.animationStep];
				let val, xt, yt;
				if(p.animationStep == 0)
				{
					let { x, y } = rwxAnimate.fromToBezier(particle.from, particle.cp1, particle.cp2, particle.to, `particlesplit${i}${p.animationStep}`, particle.easing, particle.duration, ()=>{p.animationStep+=1; p.dont = true});
					xt = x;
					yt = y;
				}
				else
				{
					val = rwxAnimate.getEasingValue(`particlesplit${i}${p.animationStep}`, particle.easing, particle.duration, ()=>{p.animationStep+=1; p.dont = true});
					xt = rwxAnimate.fromToCalc(particle.from.x, particle.to.x, val);
					yt = rwxAnimate.fromToCalc(particle.from.y, particle.to.y, val);
				}
				if(!p.dont)
				{
					p.update(xt,yt);
				}
			}
			else
			{
			// natural state wobbling around for spare particles
			// grow and change color of letterParticles once
			//magnet repulse on mouse
			// if is inside mouse circle ping to closest point on circumference 	
			// increase radius gradually tto normals

				// if(p.isLetter)
				// {
				// 	p.setRadius(5);
				// 	p.color = 'red';
				// }
				
				//p.update(p.cluster.x, p.cluster.y);
				
				p.draw();
			}
			return;
		})
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
				this.wordParticles[counter].setRadius(m.dimensions.particleSize);
				counter+=1;
				return;
			});
			return;
		});
		this.calculateSpareParticles();
	}
}

export default new rwxBitExplosions();