require('../../scss/components/rwxBitVirus.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxGeometry from '../helpers/rwxGeometryHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';

import {rwxParticle, rwxParticleShapes} from '../common/rwxParticle';

import rwxBitFontGetMatrix from '../common/rwxBitFont';

/*
	finish letters
	New component rwxBitVirus where each letter starts as group of particles which then split into a random point and then split again
	and keep splitting until a grid of smaller particles on remaining space is filled up and bitFont positions also filled up like drawing on paper
	first "virussplit" has only a few, then increases exponentially of how many it splits up to - needs a trail like blackhole variable speed per particle
	have all particles then magnet away from mousemouse using closestPointOnCircumeference of mouse particle with drag
	will need some sort of natural state, floating, circling something new>
*/


class rwxBitViruses extends rwxCore {
	constructor()
	{
		super('[rwx-bit-virus]', true);
		this.shapes = ['circle', 'square'];
		this.shapeDefault = 'circle';
		this.colorDefault = '#FFFFFF';
	}

	execute(el, mc)
	{
		let bits = el.hasAttribute('data-rwx-bit-virus-value');
		if(!bits){this.error('There is no value (data-rwx-bit-virus-value) attribute detected on the rwx-bit-virus element.'); return;}
		bits = el.getAttribute('data-rwx-bit-virus-value');
		if(!bits){this.error('There is no value in the (data-rwx-bit-virus-value) attribute.'); return;}
		let orientation = el.hasAttribute('data-rwx-bit-virus-orientation') ? el.getAttribute('data-rwx-bit-virus-orientation') : this.orientationDefault;
		let shape = el.hasAttribute('data-rwx-bit-virus-shape') ? el.getAttribute('data-rwx-bit-virus-shape') : this.shapeDefault;
		let color = el.hasAttribute('data-rwx-bit-virus-color') ? el.getAttribute('data-rwx-bit-virus-color') : this.colorDefault;
		if(!rwxParticleShapes.includes(shape)){this.error(`${shape} is not a valid shape. Valid shapes include ['${rwxParticleShapes.join("', '")}']. Using '${this.shapeDefault}'.`); shape = this.shapeDefault;}
		return new rwxBitVirus(el, mc, bits, orientation, shape, color);
	}
}

class rwxBitVirus extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.el = el;
		this.shape = shape;
		this.bits = bits;
		this.boundaryFromWordToSpareParticle = 10;
		this.orientation = orientation;
		this.bitColor = color;
		this.letterParticles = [];
		this.createCanvas();
		this.numberOfSpareParticles = 20;
		this.calculateLetterParticles();
		this.calculateSpareParticles();
		this.calculateParticlesPerLetter();
		this.designateLetterClass();
		this.createMouseParticle();
	}

	createMouseParticle()
	{
		this.mouseParticle = new rwxParticle(this.width/2, this.height/2, this.matrix[0].dimensions.bitSize, 'circle', 'red', this.c, 2);
	}

	calculateLetterParticles()
	{
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height);
		if(!this.matrix)return;
		this.matrix.map((m)=>{
			let letter = [];
			m.matrix.map((mp)=>{
				letter.push(new rwxParticle(mp.x, mp.y, m.dimensions.particleSize, this.shape, this.bitColor, this.c))
				return;
			});
			this.letterParticles.push(letter);
			return;
		});
	}

	calculateSpareParticles()
	{
		this.particles = [];
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
				this.particles.push(new rwxParticle(xCounter, yCounter, 1, this.shape, 'white', this.c));
				yCounter += yIncrement;
			}
			xCounter+=xIncrement;
			yCounter = yIncrement/2;
		}
	}

	calculateParticlesPerLetter()
	{
		let counter = this.particles.length;
		rwxMisc.shuffleArray(this.particles);
		let arr = [];
		for(let p=0;p<this.letterParticles.length;p++)
		{
			const sum = Math.ceil(this.particles.length/this.letterParticles.length);
			const howMany = (counter < sum) ? counter : sum;
			arr.push(this.particles.slice((this.particles.length - counter),(this.particles.length - counter) + howMany));
			counter -= sum;
		}
		this.spareParticlesPerLetter = arr;
	}

	designateLetterClass()
	{

	}

	scrolledIntoView()
	{
		if(this.letterParticles.length == 0){
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
		for(let p of this.particles)
		{
			p.draw();
		}
		for(let lp of this.letterParticles)
		{
			lp.map((l)=>l.draw());
		}
		//this.mouseParticle.update(this.mouse.x, this.mouse.y);
	}

	resize()
	{
		this.sizeCanvas();
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height);
		this.matrix.map((m, i)=>{
			m.matrix.map((mp, i2)=>{
				this.letterParticles[i][i2].x = mp.x;
				this.letterParticles[i][i2].y = mp.y;
				this.letterParticles[i][i2].setRadius(m.dimensions.particleSize);
				return;
			});
			return;
		});
		this.calculateSpareParticles();
	}
}

class rwxBitVirusLetter {
	constructor(letterParticles, spareParticles)
	{

	}
}

export default new rwxBitViruses();