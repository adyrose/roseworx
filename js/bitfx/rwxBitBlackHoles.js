// take blackhole from portfolio add option for bit letters in middle instead of canvas render text
// will need to add numbers to bit font for portfolio 404 page
import { rwxComponent } from '../rwxCore';

import {rwxParticle} from './rwxParticle';

import { rwxCanvas, rwxMath, rwxAnimate, rwxDOM, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

class rwxBitBlackHoles extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-black-hole');
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor)
	{
		return new rwxBitBlackHole(el, mc, bits, orientation, shape, color, bgcolor);
	}
}

class rwxBitBlackHole extends rwxComponent {
	constructor(el, manualControl, bits, orientation, shape, color, bgcolor)
	{
		super({enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl})
		this.el = el;
		this.uniqueID = rwxMisc.uniqueId();
		this.el.style.backgroundColor = bgcolor;
		this.shape = shape;
		this.bits = bits;
		this.orientation = orientation;
		this.bitColor = color;
		this.backgroundColor = bgcolor;
		this.elFullSizeAbsolute();
		this.createCanvas();
		this.dontClearRect = true;
		this.centerPoints = {
      x: this.width/2,
      y: this.height/2
    };
    this.particles = [];
    this.numberOfParticles = 500;
    this.colors = [
      "#FF355E",
      "#FF6037",
      "#FF7A00",
      "#FF6EFF", 
      "#FF00CC",
      "#FF00CC",
      "#50BFE6",
      "#7FDBFF",
      "white"
    ];
    this.innerParticleCountPercent = 0.5;
    this.outerParticleCountPercent = 0.4;
    this.innerRingRadiusBoundsPercentage = 0.20;
    this.outerRingRadiusBoundsPercentage = 0.25;
    this.particleRadiusLowerLimit = 1;
    this.particleRadiusUpperLimit = 3;
    this.velocityBounds = {
      inner: {
        min: 0.002,
        max: 0.003
      },
      middle: {
        min: 0.002,
        max: 0.001
      },
      outer: {
        min: 0.0009,
        max: 0.0006   
      }
    };

    this.generateLetterParticles();
    if(!this.matrix)return;
    this.isLandscape = this.width > this.height;
    this.aspectRatio = this.isLandscape ? (this.width / this.height) : (this.height / this.width);
    this.elongationToChange = this.isLandscape ? "x" : "y";
    this.innerParticleCountLimit = this.numberOfParticles * this.innerParticleCountPercent;
    this.outerParticleCountLimit = this.innerParticleCountLimit + (this.numberOfParticles * this.outerParticleCountPercent);
    this.useWidthOrHeight = this.isLandscape ? this.height/2 : this.width/2;
    this.innerRingRadiusLimit = (this.useWidthOrHeight * this.innerRingRadiusBoundsPercentage) + this.innerRingRadius;
    this.outerRingRadiusLimit = (this.useWidthOrHeight * this.outerRingRadiusBoundsPercentage) + this.innerRingRadiusLimit;
    this.maxRingRadiusLimit = this.useWidthOrHeight;
    this.generateParticles();
	}

	scrolledIntoView()
	{
		this.startAnimation();
		this.stopScroll = true;
	}

	generateLetterParticles()
	{
		this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height, 'sm');
		let xs = [];
		let ys = [];
		if(!this.matrix)return;
		this.matrix.map((m)=>{
			m.matrix.map((mp)=>{
				xs.push(mp.x);
				ys.push(mp.y);
				let letterparticle = new rwxParticle(mp.x, mp.y, m.dimensions.particleSize, this.shape, this.bitColor, this.c)
				letterparticle.isLetter = true;
				this.particles.push(letterparticle);
				return;
			});
			return;
		});
		let width = Math.max(...xs) - Math.min(...xs);
		let height = Math.max(...ys) - Math.min(...ys);
		console.log(width)
		this.innerRingRadius = width > height ? (width/2) : (height/2);
	}

  generateParticles()
  {
    let radius,
        color,
        rangle,
        rotationRadius,
        radians,
        velocity,
        randomElongationMultiple,
        respawnRadius,
        respawnElongation,
        elongation;
        
    for(let i=0;i<this.numberOfParticles;i++)
    {
      elongation = {
        x: 1,
        y: 1
      };
      respawnElongation = {
        x: 1,
        y: 1
      };
      radius = rwxMath.randomInt(this.particleRadiusLowerLimit, this.particleRadiusUpperLimit);   
      radians = rwxMath.randomInt(0, 360); // spawn on random point on circumference
      if(i<=this.innerParticleCountLimit)
      {
        rotationRadius = rwxMath.randomInt(this.innerRingRadius, this.innerRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.inner.min, this.velocityBounds.inner.max);
        randomElongationMultiple = rwxMath.randomFloat(0.1, 0.3);
        elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      }
      else if(i>this.innerParticleCountLimit && i <=this.outerParticleCountLimit)
      {
        rotationRadius = rwxMath.randomInt(this.innerRingRadiusLimit, this.outerRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.middle.min, this.velocityBounds.middle.max);
        randomElongationMultiple = rwxMath.randomFloat(0.3, 0.5);
        elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      }
      else
      {
        rotationRadius = rwxMath.randomInt(this.outerRingRadiusLimit, this.maxRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.outer.min, this.velocityBounds.outer.max);
        randomElongationMultiple = rwxMath.randomFloat(0.5, 0.7);
        
      }
      elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      respawnElongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * rwxMath.randomFloat(0.1, 0.7));
      respawnRadius = rwxMath.randomInt(this.innerRingRadiusLimit, this.maxRingRadiusLimit);
      let particle = new rwxParticle(0, 0, radius, 'circle', color, this.c, 1, velocity);
      particle.radians = radians;
      particle.respawnRadius = respawnRadius;
      particle.respawnElongation = respawnElongation;
      particle.rotationRadius = rotationRadius;
      particle.elongation = elongation;
      particle.colorValue = rwxMath.randomInt(1,3);
      if(i==0)particle.debug = true;
      this.particles.push(particle);
    }
  }

  updateParticles()
  {
    let percentage;
    for(let p of this.particles)
    {
    	if(!p.isLetter)
    	{
	      if(p.rotationRadius > this.innerRingRadius)
	      {
	        p.rotationRadius -= 0.1;
	      }
	      else
	      {
	        p.rotationRadius = p.respawnRadius;
	        p.elongation = p.respawnElongation;
	      }
	      p.radians += p.velocity;
	      p.y = this.centerPoints.y + Math.sin(p.radians) * p.rotationRadius * p.elongation.y; 
	      p.x = this.centerPoints.x + Math.cos(p.radians) * p.rotationRadius * p.elongation.x;

	      percentage = ((p.rotationRadius-this.innerRingRadius)/(p.respawnRadius-this.innerRingRadius))*100;
				percentage = (Math.floor(percentage)/100) * 255;
				
				p.color = `rgb(${percentage}, 0, 0)`;

				// if(p.colorValue == 1)
				// {
				// 	p.color = `rgb(${255-percentage}, 0, 0)`;
				// }
				// else if(p.colorValue == 2)
				// {
				// 	p.color = `rgb(0, ${255-percentage}, 0)`;
				// }
				// else
				// {
				// 	p.color = `rgb(0, 0, ${255-percentage})`;
				// }

    	}
      p.draw();
    }
  }

  resize()
  {
  	console.log("do");
  }

	animate()
	{
    this.c.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.c.fillRect(0, 0, this.width, this.height);
    this.updateParticles();	
	}
}

export default new rwxBitBlackHoles();