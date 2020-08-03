require('../../scss/components/rwxBitVirus.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxGeometry from '../helpers/rwxGeometryHelpers';

import {rwxParticle, rwxParticleShapes} from '../common/rwxParticle';

import rwxBitFontGetMatrix from '../common/rwxBitFont';

/*
	New component rwxBitVirus where each letter starts as group of particles which then split into a random point and then split again
	and keep splitting until a grid of smaller particles on remaining space is filled up and bitFont positions also filled up like drawing on paper
	have all particles then magnet away from mousemouse
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
		this.orientation = orientation;
		this.bitColor = color;
		this.particles = [];
		this.createCanvas();
		this.calculateParticlePoints(bits);
	}

	calculateParticlePoints(bits)
	{
		let matrix = rwxBitFontGetMatrix(bits, this.orientation, this.width, this.height);
		const xs = [];
		const ys = [];
		matrix.map((m)=>{
			xs.push(m.bitx);
			ys.push(m.bity);
			return;
		})
		let minx = Math.min(...xs);
		let maxx = Math.max(...xs);
		let miny = Math.min(...ys);
		let maxy = Math.max(...ys);
		console.log(`minx: ${minx} maxx: ${maxx} miny: ${miny} maxy: ${maxy}`);

		console.log(matrix);
		matrix.map((m)=>{
			m.matrix.map((mp)=>{
				this.particles.push(new rwxParticle(mp.x, mp.y, m.dimensions.particleSize, this.shape, this.c))
				return;
			});
			return;
		})
		// new rwxParticle(finalx, finaly, this.particleSize, this.shape, this.c);
		// new rwxParticle(finalx, finaly, this.particleSize/2, this.shape, this.c);
	}

	scrolledIntoView()
	{
		this.startAnimation();
	}

	moused()
	{

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

	animate()
	{
		for(let p of this.particles)
		{
			p.update(p.x, p.y);
		}
	}

	resize()
	{
		this.sizeCanvas();
	}
}

export default new rwxBitViruses();