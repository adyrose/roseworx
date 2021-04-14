// have them move very slowly as a natural state like floating around and repulsed away from sides until mouse activated
import { rwxComponent, rwxCore } from '../rwxCore';

import {rwxParticle} from './rwxParticle';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

import { rwxMath, rwxAnimate, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

class rwxBitSystems extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-system', true);
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor)
	{
		let disableInit = el.hasAttribute('data-rwx-bit-system-disable-init');
		return new rwxBitSystem(el, this.sanitizeColor(bgcolor, this.backgroundColorDefault), this.sanitizeColor(color,this.colorDefault), shape, disableInit);
	}

	explode(id)
	{
		const IME = this.getIME(id);
		IME && IME.explode();		
	}
	implode(id)
	{
		const IME = this.getIME(id);
		IME && IME.implode();		
	}
}

class rwxBitSystem extends rwxComponent {

	constructor(el, bgColor, bitColor, shape, disableInit)
	{
		super({enableAnimationLoop: true, enableResizeDebounce: true})
		this.el = el;
		this.background = bgColor;
		this.bitColor = bitColor;
		this.disableInit = disableInit;
		this.shape = shape;
		this.el.style.backgroundColor = this.convertToColor(this.background);
		this.uniqueID = rwxMisc.uniqueId();
		this.elFullSizeAbsolute();
		this.createCanvas();
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleOrientation = this.handleOrientation.bind(this);
		this.createConfig();
		this.calculate();
		this.startAnimation();
	}

	convertToColor(obj, o=null)
	{
		return `rgba(${obj.r},${obj.g},${obj.b},${o===null ? 1:o})`
	}

	createConfig()
	{
		this.screenRadius = Math.sqrt(Math.pow((this.width - this.width/2), 2) + Math.pow((this.height - this.height/2), 2)) + 100;
		this.centerx = this.width/2;
    this.centery = this.height/2;
    this.numberofparticles = 133;
		this.parallaxMouse = {
      x: 0,
      y: 0
    }
	}

	calculate(firstBlood=true)
	{
    this.particles = [];
    this.maskParticles = [];
    for(let i=0;i<this.numberofparticles;i++)
    {
    	let finalx = rwxMath.randomInt(0, this.width);
    	let finaly = rwxMath.randomInt(0, this.height);
   		let radius = rwxMath.randomInt(1,3);
  		let p = new rwxParticle(finalx, finaly, radius*2, this.shape, this.convertToColor(this.bitColor), this.c);
		  p.parallaxMoveValue = 2;
		  p.parallaxMoveDrag = Math.random() /  15;
		  p.parallaxMoveAmount = Math.floor(Math.random() * (20- p.parallaxMoveValue+1) +  p.parallaxMoveValue);
		  p.lastMouse = {x:0,y:0};
		  p.finalx = finalx;
		  p.finaly = finaly;
		  p.expandTo = (radius*2) + rwxMath.randomInt(20,30);
		  p.finalRadius = radius*2;
		  p.bounceTimeout = rwxMath.randomInt(0,360);
		  p.timer = 0;
		  p.cacheColor = this.bitColor;
		  p.ringSize = rwxMath.randomInt(1,5);
		  p.parallax = !firstBlood;
    	this.particles.push(p);
    	this.maskParticles.push(new rwxParticle(finalx, finaly, (radius*2)+3, this.shape, this.convertToColor(this.background), this.c));
    }
	}

  implode()
  {
  	if(!this.hasExploded)return;
    this.parallaxMouse.x = 0;
    this.parallaxMouse.y = 0;
    this.addMouseMove();
    this.explodenow = false;
    this.implodenow = true;  	
  }

  explode()
  {
    this.removeMouseMove();
    this.implodenow = false;
    this.explodenow = true;
    this.hasExploded = true;
  }

	removeMouseMove()
  {
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }

  addMouseMove()
  {
    document.body.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('deviceorientation', this.handleOrientation);
  }

  handleOrientation(event)
  {
    let alpha = event.alpha === null ? 0 : event.alpha;
    let y = event.beta === null ? 0 : event.beta;
    let x = event.gamma === null ? 0 : event.gamma;
    if (x >  90) { x =  90};
    if (x < -90) { x = -90};
    this.parallaxMouse.x = (window.innerWidth*x/180)*4;
    this.parallaxMouse.y = (window.innerHeight*y/225)*4;  
  }

  handleMouseMove(e)
  {
    this.parallaxMouse.x = (e.clientX || e.pageX) - window.innerWidth/2;
    this.parallaxMouse.y = (e.clientY || e.pageY) - window.innerHeight/2; 
  }

  resize()
  {
		this.sizeCanvas();
		this.calculate(false);
  }

  animate()
  {
  	for(let [index, p] of this.particles.entries())
  	{
  		if(p.parallax)
  		{
  			let x = p.finalx + (p.lastMouse.x/p.parallaxMoveAmount);
		    let y = p.finaly + (p.lastMouse.y/p.parallaxMoveAmount);	
		    p.update(x,y);
		    p.lastMouse.x += (this.parallaxMouse.x - p.lastMouse.x) * p.parallaxMoveDrag;
		    p.lastMouse.y += (this.parallaxMouse.y - p.lastMouse.y) * p.parallaxMoveDrag;
		 	}
  		else
  		{
  			if(this.disableInit && !this.explodenow && !this.implodenow)
  			{
  				p.parallax = true;
  				if(!this.eventAdded){this.addMouseMove();this.eventAdded=true}
  				continue;
  			}
  			p.timer +=1;
				if(p.timer>=p.bounceTimeout)
				{
	  			if(!p.expand)
	  			{
	  				let o = rwxAnimate.fromTo(1, 0.1, `systemparticleopacity${this.uniqueID}${index}`, 'easeOutQuad', 1000, ()=>{p.expand=true});
		  			let r = rwxAnimate.fromTo(0, p.expandTo, `systemparticlebounce${this.uniqueID}${index}`, 'easeOutQuad', 1000, ()=>{p.expand=true});
		  			p.setRadius(r+p.ringSize);
		  			p.color = this.convertToColor(p.cacheColor,o);
		  			this.maskParticles[index].setRadius(r);
	  			}
	  			else
	  			{
	  				if(!p.collapse)
	  				{
			  			let r = rwxAnimate.fromTo(p.expandTo, p.finalRadius, `systemparticlecollapse${this.uniqueID}${index}`, 'easeOutQuint', 2000, ()=>{p.collapse=true});
			  			let o = rwxAnimate.fromTo(0.1, 1, `systemparticleopacity2${this.uniqueID}${index}`, 'easeOutQuint', 2000, ()=>{});
			  			p.setRadius(r+p.ringSize);
			  			p.color = this.convertToColor(p.cacheColor, o);
			  			this.maskParticles[index].color = this.convertToColor(this.background, (1-o));
			  			this.maskParticles[index].setRadius(r);
	  				}
	  				else
	  				{
	  					p.parallax = true;
	  					if(!this.eventAdded){this.addMouseMove();this.eventAdded=true}
	  				}
	  			}
	  			p.draw();
	  			!p.collapse && this.maskParticles[index].draw();
	  		}
  		}
		  if(this.explodenow)
	    {
	    	p.imploded = false;
	    	p.parallax = false;
	    	if(!p.cachePosition)
	    	{
	    		p.cachePosition = {};
	    		p.cachePosition.x = p.x;
	    		p.cachePosition.y = p.y;
	    		p.cachePosition.explodeCoords = rwxGeometry.closestPointOnCircumference({x:p.x, y: p.y}, {x:this.centerx, y:this.centery}, this.screenRadius);
	    	}
	    	if(!p.exploded)
	    	{
		    	let val = rwxAnimate.getEasingValue(`systemparticleexplode${this.uniqueID}${index}`, 'easeOutQuart', 1500, ()=>{p.exploded=true})
		    	let x = rwxAnimate.fromToCalc(p.cachePosition.x, p.cachePosition.explodeCoords.x, val);
		    	let y = rwxAnimate.fromToCalc(p.cachePosition.y, p.cachePosition.explodeCoords.y, val);
		    	p.update(x,y);
	    	}
	    	else
	    	{
	    		p.draw();
	    	}
	    }
	    if(this.implodenow)
	    {
	    	p.exploded = false;
	    	if(!p.imploded)
	    	{
	    		p.parallax=false;
		    	let val = rwxAnimate.getEasingValue(`systemparticleexplode${this.uniqueID}${index}`, 'easeInQuart', 1500, ()=>{p.imploded=true;p.lastMouse = {x:0,y:0};p.parallax=true;})
		    	let x = rwxAnimate.fromToCalc(p.cachePosition.explodeCoords.x, p.finalx, val);
		    	let y = rwxAnimate.fromToCalc(p.cachePosition.explodeCoords.y, p.finaly, val);
		    	p.update(x,y);
	    	}
	    	else
	    	{
	    		p.draw();
	    	}   	
	    }
  	}
  }
}

export default new rwxBitSystems();