import { rwxCore, rwxComponent } from '../rwxCore';
import rwxCanvas from '../helpers/rwxCanvasHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';
import {rwxAnimation} from '../modules/rwxAnimation';
import {rwxParticle} from '../bitfx/rwxParticle';

class rwxCountOMeters extends rwxCore {
	constructor()
	{
		super('[rwx-countometer]', true);
	}

	execute(el, mc)
	{
		let value = el.hasAttribute('data-rwx-countometer-value');
		if(!value){this.error('There is no value (data-rwx-countometer-value) attribute detected on the rwx-countometer element.'); return;}
		value = el.getAttribute('data-rwx-countometer-value');
		return new rwxCountOMeter(el, value, mc);	
	}
}

class rwxCountOMeter extends rwxComponent {
	constructor(el, value, manualControl)
	{
		super({element: el, enableAnimationLoop: true, enableResizeDebounce: true, enableScrollIntoView: !manualControl})
		this.colors = [
	    "#ff0000",
	    "#ff1900",
	    "#ff2a00",
	    "#ff4800",
	    "#ff7700",
	    "#ff8c00",
	    "#ffa600",
	    "#ffbf00",
	    "#ffd500",
	    "#ffd500",
	    "#fff200",
	    "#fffb00",
	    "#fff700",
	    "#ffe100",
	    "#fff200",
	    "#eeff00",
	    "#d0ff00",
	    "#aeff00",
	    "#8cff00",
	    "#2fff00"
		];
    this.canvasHeight = this.el.getBoundingClientRect().width/2;
    this.createCanvas();
		this.value = value
    this.rating = this.value/10*2;
    this.timeout = 10;
    this.timeoutCounter = 0;
    this.timeoutLimit = this.timeout * this.colors.length;
    this.particleCounter = 0;
    this.animeDone = 0;
    this.particles = [];
		this.makeParticles(true);
		this.makeText(true);
	}

	scrolledIntoView()
	{
		this.startAnimation();
		this.stopScroll();
	}

	resize()
	{
		this.sizeCanvas();
		this.makeParticles();
		this.makeText();
	}

	makeText(firstblood = false)
	{
		let fontSize = this.width/10;
		if(firstblood)
		{
			this.text = new renderText(this.value, this.c, this.width, this.height, fontSize);
		}
		else
		{
			this.text.fontSize = fontSize;
			this.text.width = this.width;
			this.text.height = this.height;
			this.text.draw();
		}
	}

  makeParticles(firstblood=false) 
  {
    let x = this.width / 2,
        y = this.height,
        particleRadius = this.width/100,
        fourthQuartileDegree = 270,
        firstQuartileDegree = 90,
        degreeInterval = 180 / (this.colors.length),
        tickerDegrees = fourthQuartileDegree,
        radians,
        moveToX,
        moveToY;


    for(let p=0;p<this.rating;p++)
    {
      tickerDegrees = tickerDegrees + degreeInterval;
      let center = this.width/2 - (particleRadius*2);
      radians = tickerDegrees * (Math.PI/180);
      moveToX = (center + (center * Math.sin(radians))) + particleRadius;
      moveToY = (this.height - center * Math.cos(radians)) + particleRadius;
      if(p == (this.colors.length/2))
      {
        tickerDegrees = 0;
      }
      if(firstblood)
      {
        let pr = new rwxParticle(x, y, particleRadius*2, 'circle', this.colors[p], this.c);
        pr.animation = new rwxAnimation({
          from: [x,y],
          to: [moveToX, moveToY],
          easing: 'easeOutQuint',
          duration: 1000,
          complete: ()=>this.animeDone+=1
        })
      	this.particles.push(pr);
      }
      else
      {
      	this.particles[p].x = moveToX;
      	this.particles[p].y = moveToY;
      	this.particles[p].radius = particleRadius;
      	this.particles[p].draw(); 
      }
    }
  }

  animate()
  {
    if(this.timeoutCounter == this.timeout)
    {
      this.particleCounter++;
      if(this.particleCounter == (this.colors.length/2)+1)
      {
        this.particleCounter++;
      }
      this.timeoutCounter = 0;
    }
    for(let sp=0;sp<this.particleCounter;sp++)
    {
    	if(this.particles[sp])
    	{
	      this.particles[sp].animation.animate((x,y)=>this.particles[sp].refresh(x,y));
        this.particles[sp].draw();
    	}
    }
    if(this.particleCounter<this.rating)
    {
      this.timeoutCounter++;
    }
    if(this.particleCounter>0)
    {
      this.text.update();
    }
    if(this.animeDone == this.particles.length)
    {
    	this.stopAnimation = true;
    }
  }
}

function renderText(numberValue, c, width, height, fontSize)
{
  this.timeoutCounter = 0;
  this.number = 0;
  this.width = width;
  this.height = height;
  this.fontSize = fontSize;

  this.update = function() {
    if(this.number < numberValue && this.timeoutCounter == 2)
    {
      this.number++;
      this.timeoutCounter = 0;
    }
    this.timeoutCounter++;
    this.draw();
  }

  this.draw = function() {
    c.font = this.fontSize + 'px monospace';
    c.textAlign = 'center';
    c.fillText(this.number+"%", this.width/2, this.height-(this.fontSize));
  }
}

export default new rwxCountOMeters();