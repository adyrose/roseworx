// have them move very slowly as a natural state like floating around and repulsed away from sides until mouse activated
import { rwxComponent, rwxCore } from '../rwxCore';

import {rwxParticle} from './rwxParticle';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

import { rwxMath, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import { rwxAnimationChain, rwxAnimation } from '../modules/rwxAnimation';

class rwxBitSystems extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-system', true);
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor, nofill)
	{
		let disableInit = el.hasAttribute('data-rwx-bit-system-disable-init');
		return new rwxBitSystem(el, mc, bgcolor, this.sanitizeColor(color,this.colorDefault), shape, disableInit, nofill);
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

	constructor(el, manualControl, bgColor, bitColor, shape, disableInit, nofill)
	{
		super({element: el, enableAnimationLoop: true, enableResizeDebounce: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.background = bgColor;
		this.bitColor = bitColor;
		this.disableInit = disableInit;
		this.shape = shape;
		this.nofill = nofill;
		this.el.style.backgroundColor = this.background;
		this.mouseTrack.remove();
		this.elFullSizeAbsolute();
		this.createCanvas();
		this.createConfig();
		this.calculate();
	}

	scrolledIntoView()
	{
		this.startAnimation();
		this.stopScroll();
	}

	createConfig()
	{
		this.screenRadius = Math.sqrt(Math.pow((this.width - this.width/2), 2) + Math.pow((this.height - this.height/2), 2)) + 100;
		this.centerx = this.width/2;
    this.centery = this.height/2;
    this.numberofparticles = 133;
    this.c.lineWidth = 2;
	}

	calculate(firstBlood=true)
	{
    this.particles = [];
    for(let i=0;i<this.numberofparticles;i++)
    {
    	let finalx = rwxMath.randomInt(0, this.width);
    	let finaly = rwxMath.randomInt(0, this.height);
   		let radius = rwxMath.randomInt(3,5);
   		let et = ((radius*2) + rwxMath.randomInt(20,30));

  		let p = new rwxParticle(finalx, finaly, radius*2, this.shape, firstBlood ? this.convertToColor(this.bitColor, 0) : this.convertToColor(this.bitColor, 1), this.c);
		  p.parallaxMoveValue = 2;
		  p.parallaxMoveDrag = Math.random() /  15;
		  p.parallaxMoveAmount = Math.floor(Math.random() * (20- p.parallaxMoveValue+1) +  p.parallaxMoveValue);
		  p.lastMouse = {x:0, y:0};
		  p.finalx = finalx;
		  p.finaly = finaly;
		  p.cacheColor = this.bitColor;
		  p.ringSize = radius + rwxMath.randomInt(1,2);
		  p.parallax = !firstBlood;
		  p.chain = new rwxAnimationChain({
		  	sequence:[
		  		{
		  			from:[1, 0],
		  			to:[0.1, et],
		  			duration:1000,
		  			easing: 'easeOutQuad',
		  			delay: rwxMath.randomInt(0,3600),
		  			complete: ()=>{if(!this.nofill)p.setFill(true)}
		  		},
		  		{
		  			to: [1, (radius*2)],
		  			duration: 2000,
		  			easing: 'easeOutQuint'
		  		}
		  	],
		  	complete: ()=>{
		  		p.parallax = true;
		  		if(!this.eventAdded)
		  		{
		  			this.mouseTrack.add();
		  			this.eventAdded=true;
		  		}
		  	}
		  });
		  p.explodeAnimation = new rwxAnimation({
		  	from: [()=>this.getCurrentCoordinates(i).x, ()=>this.getCurrentCoordinates(i).y],
		  	to: [()=>this.getExplodeCoordinates(i).x, ()=>this.getExplodeCoordinates(i).y],
		  	easing: 'easeOutQuart',
		  	duration: 1500,
		  	complete: ()=>{
		  		p.implodeAnimation.reset();
		  	}
		  });
		  p.implodeAnimation = new rwxAnimation({
		  	from: [()=>this.getCurrentCoordinates(i).x, ()=>this.getCurrentCoordinates(i).y],
		  	to: [finalx, finaly],
		  	easing: 'easeInQuart',
		  	duration: 1500,
		  	complete: ()=>{
		  		p.lastMouse = {x:0,y:0};
		  		p.parallax=true;
		  		p.explodeAnimation.reset();
		  	}
		  });
		  p.setFill(!firstBlood);
		  p.setStroke(true);
		  if(!firstBlood)
		  {
	  		if(!this.eventAdded)
	  		{
	  			this.mouseTrack.add();
	  			this.eventAdded=true;
	  		}
		  }
    	this.particles.push(p);
    }
	}

	convertToColor(obj, o=null)
	{
		return `rgba(${obj.r},${obj.g},${obj.b},${o===null ? 1:o})`
	}

	getCurrentCoordinates(i)
	{
		return {x:this.particles[i].x, y:this.particles[i].y};
	}

	getExplodeCoordinates(i)
	{
		return rwxGeometry.closestPointOnCircumference({x:this.particles[i].x, y: this.particles[i].y}, {x:this.centerx, y:this.centery}, this.screenRadius);
	}

  implode()
  {
  	if(!this.hasExploded)return;
    this.mouseTrack.add();
    this.explodenow = false;
    this.implodenow = true;  	
  }

  explode()
  {
    this.mouseTrack.remove();
    this.implodenow = false;
    this.explodenow = true;
    this.hasExploded = true;
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
		    p.lastMouse.x += (this.mouseTrack.parallaxmouse.x - p.lastMouse.x) * p.parallaxMoveDrag;
		    p.lastMouse.y += (this.mouseTrack.parallaxmouse.y - p.lastMouse.y) * p.parallaxMoveDrag;
		 	}
  		else
  		{
  			if(this.disableInit && !this.explodenow && !this.implodenow)
  			{
  				p.parallax = true;
  				if(!this.eventAdded){this.mouseTrack.add();this.eventAdded=true}
  				continue;
  			}
  			p.chain.animate([
  				(opacity, radius)=>{
  					p.setRadius(radius);
  					p.color = this.convertToColor(p.cacheColor, opacity);
  				},
  				(opacity, radius)=>{
		  			p.setRadius(radius);
		  			p.color = this.convertToColor(p.cacheColor, opacity);
  				}
  			]);
		  	p.draw();
  		}
		  if(this.explodenow)
	    {
	    	p.parallax = false;
	    	p.explodeAnimation.animate((x,y)=>{ p.update(x,y); })
	    }
	    if(this.implodenow)
	    {
	    	p.implodeAnimation.animate((x,y)=>{ p.update(x,y); })  	
	    }
  	}
  }
}

export default new rwxBitSystems();