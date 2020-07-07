import { rwxCore, rwxComponent } from '../rwxCore';
import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';

class rwxCountOMeters extends rwxCore {
	constructor()
	{
		super();
	}

	execute()
	{
		const countometers = [...document.querySelectorAll('[rwx-countometer]')];
		if(countometers.length === 0){return;}
		countometers.map((com, index)=> {
			let value = com.hasAttribute('data-rwx-countometer-value');
			if(!value)return;
			value = com.getAttribute('data-rwx-countometer-value')
			const CountOMeter = new rwxCountOMeter(com, value, `CountMeter${index}`);
		 	return;
		});		
	}
}

class rwxCountOMeter extends rwxComponent{
	constructor(el, value, uniqueID)
	{
		super({enableAnimationLoop: true, enableResizeDebounce: true})
		this.el = el;
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
		this.createCanvas();
		this.calculateSize();

		this.uniqueID = uniqueID;
		this.animeCounter = [];
		this.value = value
    this.rating = this.value/10*2;
    this.timeout = 10;
    this.timeoutCounter = 0;
    this.timeoutLimit = this.timeout * this.colors.length;
    this.particleCounter = 0;
    this.particles = [];
		this.makeParticles(true);
		this.makeText(true);
    this.startAnimation();
	}

	resize()
	{
		this.calculateSize();
		this.makeParticles();
		this.makeText();
	}

	createCanvas(el)
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.el.appendChild(this.canvas);
	}

	calculateSize(el)
	{
		let meas = this.el.getBoundingClientRect();
		rwxCanvas.scale(this.canvas, this.c, meas.width, meas.width/2);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
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
      	this.particles.push(new Particle(x, y, moveToX, moveToY, particleRadius, this.colors[p], this.c, `${this.uniqueID}Particle${p}`));
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
      if(this.particles[sp].xDone && this.particles[sp].yDone && !this.animeCounter.includes(this.particles[sp].uniqueID))
      {
        this.animeCounter.push(this.particles[sp].uniqueID);
      }
      this.particles[sp].update();
    }
    if(this.particleCounter<this.rating)
    {
      this.timeoutCounter++;
    }
    if(this.particleCounter>0)
    {
      this.text.update();
    }
    if(this.animeCounter.length == this.particles.length)
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

function Particle(x, y, moveToX, moveToY, radius, color, c, uniqueID)
{
  this.uniqueID = uniqueID;
  this.radius  = radius;
  this.update = function() {
  	if(!this.xDone && !this.yDone)
  	{
  		this.x = rwxAnimate.fromTo(x, moveToX, `${uniqueID}x`, 'easeOutQuint', 1000, ()=>{this.xDone = true});
  		this.y = rwxAnimate.fromTo(y, moveToY, `${uniqueID}y`, 'easeOutQuint', 1000, ()=>{this.yDone = true});
  	}
  	this.draw();
  }

  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
    c.fillStyle = color;
    c.fill();
    c.closePath();
  }
}

export default new rwxCountOMeters();