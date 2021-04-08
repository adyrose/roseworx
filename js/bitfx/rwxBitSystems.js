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
		return new rwxBitSystem(el, this.sanitizeColor(bgcolor, this.backgroundColorDefault), this.sanitizeColor(color,this.colorDefault), shape);
	}
}

class rwxBitSystem extends rwxComponent {

	constructor(el, bgColor, bitColor, shape)
	{
		super({enableAnimationLoop: true, enableResizeDebounce: true})
		this.el = el;
		this.background = bgColor;
		this.bitColor = bitColor;
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
		this.radius = Math.sqrt(Math.pow((this.width - this.width/2), 2) + Math.pow((this.height - this.height/2), 2)) + 100;
		this.centerx = this.width/2;
    this.centery = this.height/2;
    this.numberofparticles = 133;
    this.particles = [];
    this.maskParticles = [];
		this.parallaxMouse = {
      x: 0,
      y: 0
    }
	}

	calculate()
	{
    for(let i=0;i<this.numberofparticles;i++)
    {
    	let finalx = rwxMath.randomInt(0, this.width);
    	let finaly = rwxMath.randomInt(0, this.height);
   		let radius = rwxMath.randomInt(1,3);
			let zoomCoords = rwxGeometry.closestPointOnCircumference({x:finalx, y: finaly}, {x:this.centerx, y:this.centery}, radius);
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
    	this.particles.push(p);
    	this.maskParticles.push(new rwxParticle(finalx, finaly, (radius*2)+3, this.shape, this.convertToColor(this.background), this.c));
    }
	}

  zoomIn()
  {
    this.parallaxMouse.x = 0;
    this.parallaxMouse.y = 0;
    this.addMouseMove();
    this.zoomOut = false;
    this.zoomIn = true;  	
  }

  zoomOut()
  {
    this.removeMouseMove();
    this.zoomIn = false;
    this.zoomOut = true;  	
  }

  explodeStars()
  {
    this.fastForward = false;
    this.explodeParticles = true;
    this.addMouseMove();
  }

	removeMouseMove()
  {
  	this.parallax = false;
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }

  addMouseMove()
  {
  	this.parallax = true;
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
  		if(this.zoomIn){

  		}
  		if(this.zoomOut){
  			
  		}
  	}
  }
}

export default new rwxBitSystems();