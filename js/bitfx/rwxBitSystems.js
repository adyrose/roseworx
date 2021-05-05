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
		super({element: el, enableAnimationLoop: true, enableResizeDebounce: true, enableMouseTracking:true})
		this.background = bgColor;
		this.bitColor = bitColor;
		this.disableInit = disableInit;
		this.shape = shape;
		this.el.style.backgroundColor = this.convertToColor(this.background);
		this.mouseTrack.remove();
		this.elFullSizeAbsolute();
		this.createCanvas();
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
   		let et = ((radius*2) + rwxMath.randomInt(20,30));

  		let p = new rwxParticle(finalx, finaly, radius*2, this.shape, this.convertToColor(this.bitColor), this.c);
		  p.parallaxMoveValue = 2;
		  p.parallaxMoveDrag = Math.random() /  15;
		  p.parallaxMoveAmount = Math.floor(Math.random() * (20- p.parallaxMoveValue+1) +  p.parallaxMoveValue);
		  p.lastMouse = {x:0, y:0};
		  p.finalx = finalx;
		  p.finaly = finaly;
		  p.cacheColor = this.bitColor;
		  p.ringSize = rwxMath.randomInt(1,5);
		  p.parallax = !firstBlood;
		  p.chain = new rwxAnimationChain({
		  	sequence:[
		  		{
		  			from:[1, 0],
		  			to:[0.1, et],
		  			duration:1000,
		  			easing: 'easeOutQuad',
		  			delay: rwxMath.randomInt(0,3600)
		  		},
		  		{
		  			to: [1, (radius*2)],
		  			duration: 2000,
		  			easing: 'easeOutQuint'
		  		}
		  	],
		  	complete: ()=>{
		  		p.parallax = true;
		  		p.dontDrawMask=true;
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
		  })
    	this.particles.push(p);
    	this.maskParticles.push(new rwxParticle(finalx, finaly, (radius*2)+3, this.shape, this.convertToColor(this.background), this.c));
    }
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
  					p.setRadius(radius+p.ringSize);
  					p.color = this.convertToColor(p.cacheColor, opacity);
  					this.maskParticles[index].setRadius(radius);
  				},
  				(opacity, radius)=>{
		  			p.setRadius(radius+p.ringSize);
		  			p.color = this.convertToColor(p.cacheColor, opacity);
		  			this.maskParticles[index].color = this.convertToColor(this.background, (1-opacity));
		  			this.maskParticles[index].setRadius(radius);
  				}
  			]);
  			p.draw();
  			!p.dontDrawMask && this.maskParticles[index].draw();
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