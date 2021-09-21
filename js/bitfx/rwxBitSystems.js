import { rwxCanvasComponent, rwxCore } from '../rwxCore';

import {rwxParticle} from './rwxParticle';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

import { rwxMath, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import { rwxAnimationChain, rwxAnimation } from '../modules/rwxAnimation';

class rwxBitSystems extends rwxBitFont {
	constructor()
	{
		super('rwx-bit-system', true, false, 'rwxBitSystems');
		this.allowedJoins = ['molecule', 'nucleus', 'atom'];
	}

	execute2(el, mc, bits, orientation, shape, color, bgcolor, nofill)
	{
		let disableInit = this.checkAttributeForBool(el, 'data-rwx-bit-system-disable-init');
		let joinShape = this.checkAttributeOrDefault(el, 'data-rwx-bit-system-join', false);
		if(joinShape && !this.allowedJoins.includes(joinShape))
		{
			joinShape !== "false" && this.error(`${joinShape} is not an accepted join value. Value must be one of ${this.allowedJoins.join(", ")}`);
			joinShape = false;
		}
		return new rwxBitSystem(el, mc, bgcolor, this.sanitizeColor(color,this.colorDefault), shape, disableInit, nofill, joinShape);
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

class rwxBitSystem extends rwxCanvasComponent {

	constructor(el, manualControl, bgColor, bitColor, shape, disableInit, nofill, joinShape)
	{
		super({element: el, enableAnimationLoop: true, enableResizeDebounce: true, enableScrollIntoView: !manualControl, enableMouseTracking:true})
		this.bitColor = bitColor;
		this.disableInit = disableInit;
		this.shape = shape;
		this.nofill = nofill;
		this.joinShapes = joinShape;
		this.el.style.backgroundColor = this.background;
		this.mouseTrack.remove();
		this.elFullSizeAbsolute(bgColor);
		this.createCanvas();
		this.createConfig();
		this.calculate();
		if(this.joinShapes)
		{
			this.calculateShapeJoin();
		}
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
    this.numberofparticles = 100;
    this.c.lineWidth = 2;
	}

	calculateShapeJoin()
	{
		let rcp;
		if(this.joinShapes==="molecule")rcp=20
		else if(this.joinShapes==="atom")rcp=6
		else if(this.joinShapes==="nucleus")rcp=1

		let molecules = [];
		for(let s=0;s<rcp;s++)
		{
			molecules.push(this.particles[rwxMath.randomInt(0, this.particles.length-1)])
		}

		this.particles.map((p)=>{
			let track = molecules.map((m)=>rwxGeometry.getDistance({x:p.x,y:p.y},{x:m.x,y:m.y}));
			let closestMolecule = track.findIndex((m)=>m===Math.min(...track));
			let joinTo;
			if(this.joinShapes==="molecule")joinTo = molecules[closestMolecule]
			else if(this.joinShapes==="atom")joinTo = molecules[rwxMath.randomInt(0, molecules.length-1)]
			else if(this.joinShapes==="nucleus")joinTo = molecules[0];

			p.joinTo = joinTo;
			p.joinColor = this.convertToColor(this.bitColor, 0.1);
			p.lineDash = rwxGeometry.getDistance({x: p.x, y: p.y}, {x:p.joinTo.x, y:p.joinTo.y});
			p.lineAnimation = new rwxAnimation({
				from: p.lineDash,
				to: 0,
				duration: 1500,
				easing: 'easeInOutQuint',
				complete: ()=>p.lineDash=false
			})
				return false;
		})
	}

	calculate(firstBlood=true)
	{
    this.particles = [];
    let grid = 10;
    let xCounter = 0;
    let xCounter2 = 0;
    let yCounter = 0;
    let yCounter2 = 0;
    for(let i=0;i<this.numberofparticles;i++)
    {
    	let finalx =rwxMath.randomInt(xCounter2, (window.innerWidth/grid)*(xCounter+1));
    	let finaly =rwxMath.randomInt(yCounter2, (window.innerHeight/grid)*(yCounter+1));
    	xCounter+=1;
    	xCounter2 = xCounter*(window.innerWidth/grid);

    	if(xCounter === grid){
    		xCounter=0;
    		xCounter2=0;
    		yCounter+=1;
    		yCounter2 = yCounter*(window.innerHeight/grid);
    	}

   		let radius = rwxMath.randomInt(1,8);
   		let et = ((radius*2) + rwxMath.randomInt(20,30));
  		let p = new rwxParticle(finalx, finaly, radius*2, this.shape, (firstBlood && !this.disableInit) ? this.convertToColor(this.bitColor, 0) : this.convertToColor(this.bitColor, 1), this.c);
		  p.parallaxMoveValue = 2;
		  p.parallaxMoveDrag = Math.random() /  30;
		  p.parallaxMoveAmount = Math.floor(Math.random() * (30- p.parallaxMoveValue+1) +  p.parallaxMoveValue);
		  p.lastMouse = {x:0, y:0};
		  p.finalx = finalx;
		  p.finaly = finaly;
		  p.cacheColor = this.bitColor;
		  p.ringSize = radius + rwxMath.randomInt(1,2);
		  p.parallax = !firstBlood;
		  let animationSequence = [
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
		  ];
		  p.chain = new rwxAnimationChain({
		  	sequence:animationSequence,
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
		  	duration: 1000,
		  	complete: ()=>{
		  		p.implodeAnimation.reset();
		  	}
		  });
		  p.implodeAnimation = new rwxAnimation({
		  	from: [()=>this.getCurrentCoordinates(i).x, ()=>this.getCurrentCoordinates(i).y],
		  	to: [finalx, finaly],
		  	easing: 'easeInQuad',
		  	duration: 800,
		  	complete: ()=>{
		  		p.lastMouse = {x:0,y:0};
		  		p.parallax=true;
		  		p.explodeAnimation.reset();
		  	}
		  });
		  p.setFill(this.disableInit && !this.nofill ? true : (!firstBlood && !this.nofill));
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
		if(this.joinShapes)
		{
			this.calculateShapeJoin();
		}
  }

  animate()
  {
  	for(let [index, p] of this.particles.entries())
  	{
  		if(p.parallax)
  		{
  			let x = p.finalx + (p.lastMouse.x/p.parallaxMoveAmount);
		    let y = p.finaly + (p.lastMouse.y/p.parallaxMoveAmount);
		    if(p.lineAnimation)
		    {
		    	p.lineAnimation.animate((ldo)=>{
		    		p.lineDashOffset = ldo;
		    	});
		    }
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