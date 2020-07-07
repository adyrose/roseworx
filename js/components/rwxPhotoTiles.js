require('../../scss/components/rwxPhotoTiles.scss');

import { rwxCore, rwxComponent } from '../rwxCore';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';

class rwxPhotoTiles extends rwxCore {
	constructor()
	{
		super();
	}

	execute()
	{
		const phototiles = [...document.querySelectorAll('[rwx-phototile]')];
		if(phototiles.length === 0){return;}
		phototiles.map((pt, index)=> {
			const effect = pt.hasAttribute('data-rwx-phototile-effect') ? pt.getAttribute('data-rwx-phototile-effect') : 'random';
			const auto = pt.hasAttribute('data-rwx-phototile-auto')
			const autoTimeout = auto ? pt.getAttribute('data-rwx-phototile-auto') : false;
			const noThumbnails = pt.hasAttribute('data-rwx-phototile-no-thumbnails');
			const PhotoTile = new rwxPhotoTile(pt, effect, auto, autoTimeout ? autoTimeout : 5, noThumbnails, `PhotoTile${index}`);
			this.addIME(pt.id, PhotoTile);
		 	return;
		});
	}

	goToTile(id, photoNumber, effect)
	{
		const IME = this.getIME(id);
		IME && IME.changeBackground(photoNumber, effect);
	}
}

class rwxPhotoTile extends Roseworx.Component {
  constructor(el, effect, auto, autoTimeout, noThumbnails, uniqueID)
  {
  	super({enableAnimationLoop: true, enableResizeDebounce: true});
  	this.el = el;
  	this.uniqueID = uniqueID;
  	this.photos = [...el.children]//[...el.querySelectorAll('img')];
  	if(this.photos.length == 0)return;
  	this.effectInit = effect;
  	this.createCanvas(el);
  	this.calculateSize(el);
  	this.photoLoop(el, noThumbnails);

		this.autoLoop = this.autoLoop.bind(this);
		this.counter = 0;
    this.firstblood = true;
    this.numberOfXTiles = 10;
    this.numberOfYTiles = 10;
    this.tileMatrix = [];
    this.nextTileMatrix = [];
    this.animeCounter = [];
    this.maxTimeout = 15;
    this.fx = [
      'bubble',
      'spin',
      'pixelated', 
      'slideRandom',
      'slideLeft',
      'slideRight',
      'slideUp',
      'slideDown'
    ];

    this.changeBackground(1, this.effect);

    if(auto)
    {
    	this.autoLoopInterval = autoTimeout * 60;
    	this.autoLoop();
    }
  }

  resize()
  {
		this.calculateSize();
		this.changeBackground(this.currentPhotoNumber, 'none', true); 	
  }

	isPhotoNumberInRange(number)
	{
		return (number > this.photos.length || number < 0) ? 1 : number;
	}

	autoLoop()
	{
		if(this.counter === this.autoLoopInterval)
		{
    	this.changeBackground(this.currentPhotoNumber+1, this.effectInit);
			this.counter = 0;
		}
		else
		{
			this.counter+=1;
		}
		window.requestAnimationFrame(this.autoLoop);
	}

  photoLoop(el, noThumbnails)
  {
  	const c = document.createElement('div');
  	c.classList.add('rwx-phototile-container');
  	this.photos.map((img, i)=>{
  		c.appendChild(img);
  		img.addEventListener('keyup', (ev)=>{
  			if(ev.keyCode == 13 || ev.keyCode == 32)
  			{
  				this.changeBackground(i+1, this.effectInit);
  			}
  			else if(ev.keyCode == 37){
  				this.photos[i == 0 ? this.photos.length-1 : i-1].focus();
  			}
  			else if(ev.keyCode == 39){
  				this.photos[i+1 == this.photos.length ? 0 : i+1].focus();
  			}
  		});
  		img.addEventListener('click', ()=>{this.changeBackground(i+1, this.effectInit)});
  		if(noThumbnails){img.style.display = "none"}
  		return;
  	});
  	el.appendChild(c);
  }

  calculateSize()
  {
  	let heights = []
  	let widths = [];
  	this.photos.map((img, i)=>{
  		if(img.nodeName != "IMG") return
  		heights.push(img.naturalHeight);
  		widths.push(img.naturalWidth);
  		return
  	});
  	let maxWidth = Math.max(...widths);
  	let maxHeight = Math.max(...heights);
  	let rect = this.el.getBoundingClientRect();

  	if(maxWidth > rect.width){maxWidth = rect.width;}
  	if(maxWidth < maxHeight){maxHeight = maxWidth;}

  	rwxCanvas.scale(this.canvas, this.c, maxWidth, maxHeight);
  }

  createCanvas(el)
  {
  	this.canvas = document.createElement('canvas');
  	this.c = this.canvas.getContext('2d');
  	el.appendChild(this.canvas);
  }


  changeBackground(photoNumber, effect, force=false)
  {
  	if(!force)
  	{
  		if(this.currentPhotoNumber == photoNumber || !this.stopAnimation)return;
  	}
   	photoNumber = this.isPhotoNumberInRange(photoNumber)
    this.currentPhotoNumber = photoNumber;
    let node = this.photos[photoNumber-1];
    let value, matrix, changeType;
    let isImg = node.nodeName == "IMG";
    if(isImg)
    {
    	value = node;
      matrix = this.calculateImageMatrix(value);
      changeType = "img";    	
    }
    else
    {
    	value = getComputedStyle(node)['backgroundColor'];
      matrix = this.calculateColorMatrix();
      changeType = "color";    	
    }

    this.effect = this.fx.includes(effect) ? effect : this.fx[rwxMath.randomInt(0, this.fx.length-1)];
    if(effect == 'none'){this.effect = 'none';}

    this.nextTileMatrix = [];
    for(let [index, t] of matrix.entries())
    {
      let timeout = rwxMath.randomInt(0, this.maxTimeout);
      let obj = {
        sx:t.sx,
        sy:t.sy,
        sw:t.sw,
        sh:t.sh,        
        dx:t.dx,
        dy:t.dy,
        dw:t.dw,
        dh:t.dh,
        changeType: changeType,
        timeout: timeout,
        value: value
      }

      if(this.firstblood)
      {
        let tile = new Tile(this.c, obj.value, obj.changeType, obj.sx, obj.sy, obj.sw, obj.sh, obj.dx, obj.dy, obj.dw, obj.dh, obj.timeout, `${this.uniqueID}${index}`);        
        this.tileMatrix.push(tile);
        tile[changeType]();        
      }
      else
      {
        this.nextTileMatrix.push(obj);
        if(index == matrix.length-1)
        {
          this.resetAnimation();
          this.stopAnimation = false;
          this.animateLoop();
        }
      }        
    }
    this.firstblood = false;    
  }

  calculateColorMatrix()
  {
    let colorMatrix = [];
    let xincrement = this.canvas.width / this.numberOfXTiles;
    let yincrement = this.canvas.height / this.numberOfYTiles;
    for(let y=0;y<this.numberOfYTiles;y++)
    {
      for(let x=0;x<this.numberOfXTiles;x++)
      {
        colorMatrix.push({
          sx: (x*xincrement),
          sy: (y*yincrement), 
          sw: xincrement, 
          sh: yincrement,
          dx: (x*xincrement),
          dy: (y*yincrement), 
          dw: xincrement, 
          dh: yincrement,  
        });
      }
    }
    return colorMatrix;    
  }

  calculateImageMatrix(img)
  {
    let sx = 0;
    let sw = img.naturalWidth;
    let sy = 0;
    let sh = img.naturalHeight;
    if(img.naturalWidth > this.canvas.width)
    {
      sx = (img.naturalWidth - this.canvas.width) / 2;
      sw = this.canvas.width;
    }
    if(img.naturalHeight > this.canvas.height)
    {
      sy = (img.naturalHeight - this.canvas.height) / 2;
      sh = this.canvas.height;
    }
    let xincrement = sw / this.numberOfXTiles;
    let yincrement = sh / this.numberOfYTiles;
    let xOffset = img.naturalWidth < this.canvas.width ? (this.canvas.width-img.naturalWidth)/2 : 0;
    let yOffset = img.naturalHeight < this.canvas.height ? (this.canvas.height-img.naturalHeight)/2 : 0;
    let imageMatrix = [];
    for(let y=0;y<this.numberOfYTiles;y++)
    {
      for(let x=0;x<this.numberOfXTiles;x++)
      {
        imageMatrix.push({
          sx: sx + (x*xincrement),
          sy: sy + (y*yincrement), 
          sw: xincrement, 
          sh: yincrement, 
          dx: (x*xincrement) + xOffset, 
          dy: (y*yincrement) + yOffset, 
          dw: xincrement, 
          dh: yincrement
        });
      }
    }
    return imageMatrix;
  }

  resetAnimation()
  {
    this.stopAnimation = true;
    this.animeCounter = [];
    this.tileMatrix.map((t)=>{t.reset()});    
  }

  animate()
  {
    for(let [index,tile] of this.tileMatrix.entries())
    {
      if(!tile.nextMatrix)
      {
        tile.nextMatrix = this.nextTileMatrix[index];
      }
      if(tile.animeDone && !this.animeCounter.includes(index))
      {
        this.animeCounter.push(index);
      }
      tile[this.effect]();
    }
    if(this.animeCounter.length == this.tileMatrix.length)
    {
    	// run custom events
      this.resetAnimation();
    }
  }
}

function Tile(c, value, changeType, sx, sy, sw, sh, dx, dy, dw, dh, timeout, uniqueID)
{
	this.uniqueID = uniqueID;
  this.timeoutCounter = 0;
  this.duration = 500;
  this.slideDirections = ['slideLeft', 'slideRight', 'slideUp', 'slideDown'];
  this.scaleFactor = 2;

  Object.assign(this, {value, changeType, sx, sy, sw, sh, dx, dy, dw, dh, timeout});

  this.reset = function() {
    this.shrunk = false;
    this.timeoutCounter = 0;
    this.animeDone = false;
    this.slideShrunk = false;
    this.nextMatrix = false;
    this.slideDirection = false;
    this.opaque = false;
    this.scaled = false;
    this.unscaled = false;
    this.rotated = false;
    this.switched = false;
    this.initialised = false;
    this.bubbled = false;
  }

  this.initialise = function() {
    if(!this.initialised)
    {
      this.initdx = this.dx;
      this.initdy = this.dy;
      this.initdh = this.dh;
      this.initdw = this.dw;
      this.initsx = this.sx;
      this.initsy = this.sy;
      this.initsh = this.sh;
      this.initsw = this.sw;
      this.initcenterX = this.dx + (this.dw*0.5);
      this.initcenterY = this.dy + (this.dh*0.5);
      this.initradius = this.initcenterX - this.dx + 10; // + 10 bit of breathign room
    }
    this.initialised = true;
  }

  this.switch = function(translate=true) {
    if(!this.switched)
    {
      this.value = this.nextMatrix.value;
      this.changeType = this.nextMatrix.changeType;
      this.sw = this.nextMatrix.sw;
      this.sx = this.nextMatrix.sx;
      this.sh = this.nextMatrix.sh;
      this.sy = this.nextMatrix.sy;
      this.centerX = this.nextMatrix.dx + (this.nextMatrix.dw*0.5);
      this.centerY = this.nextMatrix.dy + (this.nextMatrix.dh*0.5);
      this.radius = this.centerX - this.nextMatrix.dx + 10; // + 10 bit of breathign room
      if(translate)
      {
        this.dw = this.nextMatrix.dw;
        this.dx = this.nextMatrix.dx;
        this.dh = this.nextMatrix.dh;
        this.dy = this.nextMatrix.dy;
      }
    }
    this.switched = true;
  }

  this.unscale = function()
  {
    let val = rwxAnimate.getEasingValue(`${this.uniqueID}-UnscaleAnimation`, 'easeInQuart', this.duration, ()=>{this.unscaled = true;} )
    this.dw += (this.nextMatrix.dw - this.dw)*val;
    this.dh += (this.nextMatrix.dh - this.dh)*val;
    this.dx += (this.nextMatrix.dx - this.dx)*val;
    this.dy += (this.nextMatrix.dy - this.dy)*val;      
  }

  this.scale = function ()
  {
    let val = rwxAnimate.getEasingValue(`${this.uniqueID}-ScaleAnimation`, 'easeOutQuart', this.duration, ()=>{this.scaled = true;} )
    this.dw = rwxAnimate.fromToCalc(this.initdw, (this.initdw/this.scaleFactor), val);
    this.dh = rwxAnimate.fromToCalc(this.initdh, (this.initdh/this.scaleFactor), val);
    this.dx = rwxAnimate.fromToCalc(this.initdx, (this.initdx+(this.initdw/this.scaleFactor)/2), val);
    this.dy = rwxAnimate.fromToCalc(this.initdy, (this.initdy+(this.initdh/this.scaleFactor)/2), val);   
  }

  this.spin = function() {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      if(this.scaled)
      {
        if(this.rotated)
        {
          if(this.unscaled)
          {
            this.animeDone = true;
          }
          else
          {
            this.unscale();
          }
        }
        else
        {
        	let val = rwxAnimate.getEasingValue(`${this.uniqueID}-RotatedAnimation`, 'easeInOutQuad', this.duration, ()=>{this.rotated = true;} )
          c.translate(this.initcenterX, this.initcenterY);
          c.rotate((val*360) * Math.PI / 180);
          c.translate(-this.initcenterX, -this.initcenterY);
          if(val > 0.5)
          {
            this.switch(false);
          }
        }
      }
      else
      {
        this.scale();
      }
    } 
    this[this.changeType]();
    c.setTransform(1, 0, 0, 1, 0, 0);
    this.timeoutCounter++;      
  }

  this.pixelated = function ()
  {
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      if(this.opaque)
      {
      	let val2 = rwxAnimate.getEasingValue(`${this.uniqueID}-DoneAnimation`, 'easeInOutQuint', this.duration, ()=>{this.animeDone = true;} )
        this.switch();
        c.globalAlpha = val2;
      }
      else
      {
      	let val = rwxAnimate.getEasingValue(`${this.uniqueID}-OpaqueAnimation`, 'easeInOutQuint', this.duration, ()=>{this.opaque = true;} )
        c.globalAlpha = 1 - val;
      }
    } 
    this[this.changeType]();
    this.timeoutCounter++;  
  }

  this.slideRandom = function() {if(!this.slideDirection){this.slideDirection = this.slideDirections[Math.floor(Math.random() * ((this.slideDirections.length-1)-0+1) + 0)];} this.slide();}
  this.slideLeft = function(){if(!this.slideDirection){this.slideDirection = "slideLeft"}this.slide();}
  this.slideRight = function(){if(!this.slideDirection){this.slideDirection = "slideRight"}this.slide();}
  this.slideUp = function(){if(!this.slideDirection){this.slideDirection = "slideUp"}this.slide();}
  this.slideDown = function(){if(!this.slideDirection){this.slideDirection = "slideDown"}this.slide();}

  this.slide = function () {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      if(this.slideShrunk)
      {
      	let val2 = rwxAnimate.getEasingValue(`${this.uniqueID}-DoneAnimation`, 'easeInQuad', this.duration, ()=>{this.animeDone = true;} )
        this.switch();
        if(this.slideDirection == "slideLeft" || this.slideDirection == "slideRight")
        {
          this.dw = rwxAnimate.fromToCalc(0, this.nextMatrix.dw, val2);
          this.sw = rwxAnimate.fromToCalc(0, this.nextMatrix.sw, val2);
          if(this.slideDirection == "slideRight")
          {
          	this.dx = rwxAnimate.fromToCalc((this.nextMatrix.dx + this.nextMatrix.dw), this.nextMatrix.dx, val2); 
            this.sx = rwxAnimate.fromToCalc((this.nextMatrix.sx + this.nextMatrix.sw), this.nextMatrix.sx, val2);
          }
        }
        if(this.slideDirection == "slideUp" || this.slideDirection == "slideDown")
        {
          this.dh = rwxAnimate.fromToCalc(0, this.nextMatrix.dh, val2);
          this.sh = rwxAnimate.fromToCalc(0, this.nextMatrix.sh, val2);
          if(this.slideDirection == "slideDown")
          {

            this.dy = rwxAnimate.fromToCalc((this.nextMatrix.dy + this.nextMatrix.dh), this.nextMatrix.dy, val2); 
            this.sy = rwxAnimate.fromToCalc((this.nextMatrix.sy + this.nextMatrix.sh), this.nextMatrix.sy, val2);
          }
        }
      }
      else
      {
        let val = rwxAnimate.getEasingValue(`${this.uniqueID}-SlideAnimation`, 'easeOutQuad', this.duration, ()=>{this.slideShrunk = true;} )
        if(this.slideDirection == "slideLeft" || this.slideDirection == "slideRight")
        {
        	this.dw = rwxAnimate.fromToCalc(this.initdw, 0, val);
        	this.sw = rwxAnimate.fromToCalc(this.initsw, 0, val);
          if(this.slideDirection == "slideRight")
          {
            this.dx = rwxAnimate.fromToCalc(this.initdx, (this.initdx+this.initdw), val); 
            this.sx = rwxAnimate.fromToCalc(this.initsx, (this.initsx+this.initsw), val); 
          }
        }

        if(this.slideDirection == "slideUp" || this.slideDirection == "slideDown")
        {
          this.dh = rwxAnimate.fromToCalc(this.initdh, 0, val); 
          this.sh = rwxAnimate.fromToCalc(this.initsh, 0, val);
          if(this.slideDirection == "slideDown")
          {
          	this.dy = rwxAnimate.fromToCalc(this.initdy, (this.initdy+this.initdh), val);
            this.sy = rwxAnimate.fromToCalc(this.initsy, (this.initsy+this.initsh), val);
          }
        }
      }
    }
    this[this.changeType]();
    this.timeoutCounter++;
  }

  this.bubble = function() {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      if(this.bubbled)
      {
        this.switch();
        let val2 = rwxAnimate.getEasingValue(`${this.uniqueID}-DoneAnimation`, 'linear', this.duration, ()=>{this.animeDone = true;} );
        this.radius = rwxAnimate.fromToCalc(0,(this.centerX - this.nextMatrix.dx + 10) , val2);
      }
      else
      {
      	let val = rwxAnimate.getEasingValue(`${this.uniqueID}-BubbleAnimation`, 'linear', this.duration, ()=>{this.bubbled = true;} );
        this.centerX = this.initcenterX;
        this.centerY = this.initcenterY;
        this.radius = rwxAnimate.fromToCalc(this.initradius, 0 , val);
      }
      c.save();
      c.beginPath();
      c.arc(this.centerX, this.centerY, this.radius, 0, Math.PI*2);
      c.clip();
      c.closePath();   
    }
    this[this.changeType]();
    c.restore();
    this.timeoutCounter++;
  }

  this.color = function() {
    c.beginPath();
    c.fillStyle = this.value;
    c.rect(this.dx+1, this.dy+1, this.dw+1, this.dh+1);
    c.fill();
    c.closePath();
  }

  this.none = function() {
  	this.initialise();
    this.dw = this.nextMatrix.dw;
    this.dh = this.nextMatrix.dh;
    this.dx = this.nextMatrix.dx;
    this.dy = this.nextMatrix.dy;
    this.sx = this.nextMatrix.sx;
    this.sy = this.nextMatrix.sy;
    this.sw = this.nextMatrix.sw;
    this.sh = this.nextMatrix.sh;
    this[this.changeType]();
    this.animeDone = true;
  }

  this.img = function() {
    c.drawImage(this.value, this.sx, this.sy, this.sw, this.sh, this.dx, this.dy, this.dw, this.dh);
  }
} 

export default new rwxPhotoTiles();