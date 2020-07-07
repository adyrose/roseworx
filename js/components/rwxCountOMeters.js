import { rwxCore, rwxComponent } from '../rwxCore';

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
			const CountOMeter = new rwxCountOMeter(com, value);
		 	return;
		});		
	}
}

class rwxCountOMeter extends rwxComponent{
	constructor(el, value)
	{
		super({enableAnimationLoop: true, enableResizeDebounce: true})
		this.el = el;
		this.colors = [
	    "#ff4100",
	    "#f44242",
	    "#f44641",
	    "#f44d41",
	    "#f45541",
	    "#f45e41",
	    "#f46741",
	    "#f47f41",
	    "#f48541",
	    "#f4a641",
	    "#f4dc41",
	    "#f4be41",
	    "#f4c741",
	    "#f4ee41",
	    "#f1f441",
	    "#dff441",
	    "#b5f441",
	    "#91f441",
	    "#6af441",
	    "#55f441"
		];
		this.createCanvas();
		this.calculateSize();



		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.fontSize = this.width/10;
    this.particleRadius = this.width/100;
    this.rating = value/10*2;
    this.particleSpeed = 0.05;
    this.timeout = 10;
    this.timeoutCounter = 0;
    this.timeoutLimit = this.timeout * this.colors.length;
    this.textTimeout = 2;
    this.particleCounter = 0;
    this.particles = [];
    this.text = new renderText(value, this.c, this.width, this.height, this.textTimeout, this.fontSize);
    this.createParticles();
    this.animateLoop();
	}

	resize()
	{
		this.calculateSize();
		//reposition dots and text man
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
	}

  createParticles() 
  {
    var x = this.width / 2,
        y = this.height,
        particles = this.rating,
        fourthQuartileDegree = 270,
        firstQuartileDegree = 90,
        degreeInterval = 180 / (this.colors.length),
        tickerDegrees = fourthQuartileDegree,
        radians,
        moveToX,
        moveToY;

    for(let p=0;p<particles;p++)
    {
      tickerDegrees = tickerDegrees + degreeInterval;
      let center = this.width/2 - (this.particleRadius*2);
      radians = tickerDegrees * (Math.PI/180);
      moveToX = (center + (center * Math.sin(radians))) + this.particleRadius;
      moveToY = (this.height - center * Math.cos(radians)) + this.particleRadius;
      if(p == (this.colors.length/2))
      {
        tickerDegrees = 0;
      }
      this.particles.push(new pcuParticle(x, y, moveToX, moveToY, this.particleRadius, this.colors[p], this.particleSpeed, this.c, this.pixelRatio));
    }
  }

  animateta()
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
      this.pcuParticles[sp].update();
    }
    if(this.particleCounter<this.rating)
    {
      this.timeoutCounter++;
    }
    if(this.particleCounter>0)
    {
      this.text.update();
    }
  }
}


function pcu(el, colors, pixelRatio)
{
  Object.assign(this,{el,colors,pixelRatio});
  this.init = function()
  {
    // this.width = el.getAttribute('width');
    // this.height = this.width/2;
    // this.canvasWidth = this.width * this.pixelRatio;
    // this.canvasHeight = this.height * this.pixelRatio;
    // this.fontSize = this.width/10;
    // this.particleRadius = this.width/100;
    // this.initRating = el.getAttribute('data-pcu-rating');
    // this.rating = this.initRating/10*2,
    // this.particleSpeed = 0.05;
    // this.pcuParticles = [];

    // this.timeout = 10;
    // this.timeoutCounter = 0;
    // this.timeoutLimit = this.timeout * this.colors.length;
    // this.pcuParticleCounter = 0;
    // this.textTimeout = 2;
    //this.sizeCanvas();
    this.createPcuParticles();
    //this.text = new renderText(this.initRating, this.c, this.width, this.height, this.textTimeout, this.fontSize);
    this.animate = this.animate.bind(this);
    this.animate();
  }

  this.createPcuParticles = function() 
  {
    var x = this.width / 2,
        y = this.height,
        particles = this.rating,
        fourthQuartileDegree = 270,
        firstQuartileDegree = 90,
        degreeInterval = 180 / (this.colors.length),
        tickerDegrees = fourthQuartileDegree,
        radians,
        moveToX,
        moveToY;

    for(let p=0;p<particles;p++)
    {
      tickerDegrees = tickerDegrees + degreeInterval;
      let center = this.width/2 - (this.particleRadius*2);
      radians = tickerDegrees * (Math.PI/180);
      moveToX = (center + (center * Math.sin(radians))) + this.particleRadius;
      moveToY = (this.height - center * Math.cos(radians)) + this.particleRadius;
      if(p == (this.colors.length/2))
      {
        tickerDegrees = 0;
      }
      this.pcuParticles.push(new pcuParticle(x, y, moveToX, moveToY, this.particleRadius, this.colors[p], this.particleSpeed, this.c, this.pixelRatio));
    }
  }

  this.animate = function()
  {
    requestAnimationFrame(this.animate);
    this.c.clearRect(0, 0, this.width, this.height);
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
      this.pcuParticles[sp].update();
    }
    if(this.particleCounter<this.rating)
    {
      this.timeoutCounter++;
    }
    if(this.particleCounter>0)
    {
      this.text.update();
    }
  }
}

function renderText(numberValue, c, width, height, timeout, fontSize)
{
  this.timeoutCounter = 0;
  this.number = 0;

  this.update = function() {
    if(this.number < numberValue && this.timeoutCounter == timeout)
    {
      this.number++;
      this.timeoutCounter = 0;
    }
    this.timeoutCounter++;
    this.draw();
  }

  this.draw = function() {
    c.font = fontSize + 'px monospace';
    c.textAlign = 'center';
    c.fillText(this.number+"%", width/2, height-(fontSize));
  }
}

function pcuParticle(x, y, moveToX, moveToY, radius, color, speed, c, pixelRatio)
{
  Object.assign(this, {x, y, moveToX, moveToY, radius, color, speed, c});

  this.update = function() {
 
    this.x += (this.moveToX-this.x) * this.speed;
    this.y += (this.moveToY-this.y) * this.speed;
    this.draw();
  }

  this.draw = function() {
    c.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
    c.fillStyle = color;
    c.fill();
    c.closePath();
  }
}

export default new rwxCountOMeters();