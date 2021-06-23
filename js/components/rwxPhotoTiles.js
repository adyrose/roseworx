require('../../scss/components/rwxPhotoTiles.scss');

import { rwxCore, rwxComponent } from '../rwxCore';
import rwxMath from '../helpers/rwxMathHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';
import rwxCanvas from '../helpers/rwxCanvasHelpers';

import { rwxAnimation, rwxAnimationChain, rwxAnimate } from '../modules/rwxAnimation';

class rwxPhotoTiles extends rwxCore {
	constructor()
	{
		super('[rwx-phototile]');
    this.defaultEffect = 'random';
    this.defaultTimeout = 5;
	}

	execute(el)
	{
		const effect = this.checkAttributeOrDefault(el, 'data-rwx-phototile-effect', this.defaultEffect);
		const auto = this.checkAttributeForBool(el, 'data-rwx-phototile-auto');
		const autoTimeout = this.checkAttributeOrDefault(el, 'data-rwx-phototile-auto-timeout', this.defaultTimeout);
		const noThumbnails = this.checkAttributeForBool(el, 'data-rwx-phototile-no-thumbnails');
		return new rwxPhotoTile(el, effect, auto, autoTimeout, noThumbnails);
	}

	goToTile(id, photoNumber, effect)
	{
    if(!this.validateParameter(photoNumber, 'number', 'goToTile'))return;
		const IME = this.getIME(id);
    if(IME && !IME.fx.includes(effect)){this.error(`${effect} is not a valid effect, picking random one.`)}
		IME && IME.changeBackground(photoNumber, effect, false, false);
	}
}

class rwxPhotoTile extends rwxComponent {
  constructor(el, effect, auto, autoTimeout, noThumbnails)
  {
  	super({element: el, enableAnimationLoop: true, enableResizeDebounce: true});
  	this.photos = [...el.children];
  	if(this.photos.length == 0)return;
  	this.effectInit = effect;
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

    this.deferImageLoad().then(()=>{
      this.createCanvas();
      this.calculateSize();
      this.photoLoop(noThumbnails);

      this.changeBackground(1, this.effectInit);

      if(auto)
      {
        this.autoLoopInterval = autoTimeout * 60;
        this.autoLoop();
      }
    });
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

  cleanUp()
  {
    this.stopLoop = true;
    this.cloned.map((img)=>{
      this.el.appendChild(img);
      return false;
    });
  }

	autoLoop()
	{
    if(this.stopLoop)return;
		if(this.counter >= this.autoLoopInterval)
		{
    	let done = this.changeBackground(this.currentPhotoNumber+1, this.effectInit);
      this.counter = 0;
		}
		else
		{
			this.counter+=1;
		}
		window.requestAnimationFrame(this.autoLoop);
	}

  photoLoop(noThumbnails)
  {
  	this.container = document.createElement('div');
  	this.container.classList.add('rwx-phototile-container');
    this.cloned = this.photos.map((img)=>img.cloneNode());
  	this.photos.map((img, i)=>{
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
      this.container.appendChild(img);
  		return;
  	});
    this.addElement(this.el, this.container);
  }

  deferImageLoad()
  {
    const images = this.photos.filter((p)=>p.nodeName==="IMG");
    const complete = images.map((i)=>i.complete).every((e)=>e)
    if(complete)
    {
      return new Promise((resolve, reject)=>{resolve()})
    }
    return new Promise((resolve, reject)=>{
      let imageLoaded = [];
      images.map((p,i)=>p.onload = ()=>{
          imageLoaded.push(i);
          if(imageLoaded.length===images.length)
          {
            resolve();
          }
        }
      )
    })
  }

  calculateSize()
  {
  	let heights = []
  	let widths = [];
  	this.photos.map((img, i)=>{
  		if(img.nodeName != "IMG") return;
  		heights.push(img.naturalHeight);
  		widths.push(img.naturalWidth);
  		return false;
  	});
  	let maxWidth = Math.max(...widths);
  	let maxHeight = Math.max(...heights);
  	let rect = this.el.getBoundingClientRect();

  	if(maxWidth > rect.width){maxWidth = rect.width;}
  	if(maxWidth < maxHeight){maxHeight = maxWidth;}

    this.canvasWidth = maxWidth;
    this.canvasHeight = maxHeight;
    this.sizeCanvas();
  }

  changeBackground(photoNumber, effect, force=false, allowReloop=true)
  {
  	if(!force)
  	{
  		if(this.currentPhotoNumber === photoNumber || !this.stopAnimation)return;
  	}
    if(!allowReloop)
    {
      if(photoNumber > this.photos.length || photoNumber < 0) return;
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
        let tile = new Tile(this.c, obj.value, obj.changeType, obj.sx, obj.sy, obj.sw, obj.sh, obj.dx, obj.dy, obj.dw, obj.dh, obj.timeout, this.pixelRatio);        
        this.tileMatrix.push(tile);
        tile[changeType]();        
      }
      else
      {
        this.nextTileMatrix.push(obj);
        if(index == matrix.length-1)
        {
          this.resetAnimation();
          this.startAnimation();
        }
      }        
    }
    this.firstblood = false;    
  }

  calculateColorMatrix()
  {
    let colorMatrix = [];
    let xincrement = this.width / this.numberOfXTiles;
    let yincrement = this.height / this.numberOfYTiles;
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
    if(img.naturalWidth > this.width)
    {
      sx = (img.naturalWidth - this.width) / 2;
      sw = this.width;
    }
    if(img.naturalHeight > this.height)
    {
      sy = (img.naturalHeight - this.height) / 2;
      sh = this.height;
    }
    let xincrement = sw / this.numberOfXTiles;
    let yincrement = sh / this.numberOfYTiles;
    let xOffset = img.naturalWidth < this.width ? (this.width-img.naturalWidth)/2 : 0;
    let yOffset = img.naturalHeight < this.height ? (this.height-img.naturalHeight)/2 : 0;
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
    this.startedAnimation = false;
    this.animeCounter = [];
    this.tileMatrix.map((t)=>{t.reset();t.animation=this.effect;});    
  }

  animate()
  {
    for(let [index,tile] of this.tileMatrix.entries())
    {
      if(!tile.nextMatrix)
      {
        tile.nextMatrix = this.nextTileMatrix[index];
      }
      if(tile.animeDone && !this.animeCounter.includes(tile.uniqueID))
      {
        this.animeCounter.push(tile.uniqueID);
      }
      tile[this.effect]();
    }
    if(this.animeCounter.length == this.tileMatrix.length)
    {
    	// run custom events if any
      this.resetAnimation();
    }
  }
}

function Tile(c, value, changeType, sx, sy, sw, sh, dx, dy, dw, dh, timeout, pixelRatio)
{
	this.uniqueID = rwxMisc.uniqueId();
  this.timeoutCounter = 0;
  this.duration = 500;
  this.slideDirections = ['slideLeft', 'slideRight', 'slideUp', 'slideDown'];
  this.scaleFactor = 2;

  Object.assign(this, {c, value, changeType, sx, sy, sw, sh, dx, dy, dw, dh, timeout, pixelRatio});

  this.buildAnimations = function() {
    if(this.animation==="bubble")
    {
      this.bubbleAnimation = new rwxAnimationChain({
        sequence: [
          {
            from:this.initradius,
            to:0,
            easing: 'linear',
            duration: this.duration,
            complete: ()=>{
              this.switch();
            }
          },
          {
            to: ()=>{return (this.getCenterX() - this.nextMatrix.dx + 10)},
            easing: 'linear',
            duration: this.duration
          }
        ],
        complete: ()=>this.animeDone=true
      });
    }
    if(this.animation==="spin")
    {
      this.spinAnimation = new rwxAnimationChain({
        sequence:[
          {
            from: [this.initdw, this.initdh, this.initdx, this.initdy],
            to: [(this.initdw/this.scaleFactor), (this.initdh/this.scaleFactor), (this.initdx+(this.initdw/this.scaleFactor)/2), (this.initdy+(this.initdh/this.scaleFactor)/2)],
            easing: 'easeOutQuart',
            duration: this.duration
          },
          {
            from: 0,
            to: 1,
            easing: 'easeInOutQuad',
            duration: this.duration
          },
          {
            from: 0,
            to: 1,
            easing: 'easeInQuart',
            duration: this.duration
          }
        ],
        complete: ()=>this.animeDone=true
      });
    }
    if(this.slideDirections.includes(this.animation) || this.animation==="slideRandom")
    {
      this.slideDirection = this.animation;
      if(this.animation==="slideRandom")
      {
        this.slideDirection = this.slideDirections[rwxMath.randomInt(0,this.slideDirections.length-1)];
      }

      this.slideAnimation = new rwxAnimationChain({
        sequence: [
          {
            from: 0,
            to:1,
            easing: 'easeInQuad',
            duration: this.duration,
            complete: ()=>window.requestAnimationFrame(()=>this.switch())
          },
          {
            from:0,
            to:1,
            easing: 'easeOutQuad',
            duration:this.duration
          }
        ],
        complete: ()=>this.animeDone=true
      })
    }
    if(this.animation === "pixelated")
    {
      this.pixelatedAnimation = new rwxAnimationChain({
        sequence: [
          {
            from: 1,
            to: 0,
            duration: this.duration,
            easing: 'easeInOutQuint',
            complete: ()=>this.switch()
          },
          {
            to:1,
            duration: this.duration,
            easing: 'easeInOutQuint'
          }
        ],
        complete: ()=>this.animeDone=true 
      })
    }
  }

  this.getCenterX = ()=>{
    return this.centerX;
  }

  this.reset = function() {
    this.timeoutCounter = 0;
    this.animeDone = false;
    this.nextMatrix = false;
    this.switched = false;
    this.initialised = false;
    delete this.bubbleAnimation;
    delete this.spinAnimation;
    delete this.slideAnimation;
    delete this.pixelatedAnimation;
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
      this.initialised = true;
      this.buildAnimations();
    }
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
      if(translate)
      {
        this.dw = this.nextMatrix.dw;
        this.dx = this.nextMatrix.dx;
        this.dh = this.nextMatrix.dh;
        this.dy = this.nextMatrix.dy;
      }
      this.switched = true;
    }
  }

  this.spin = function() {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      this.spinAnimation.animate([
        (w, h, x, y)=>{
          this.dw = w;
          this.dh = h;
          this.dx = x;
          this.dy = y;
        },
        (v)=>{
          this.c.translate(this.initcenterX, this.initcenterY);
          this.c.rotate((v*360) * Math.PI / 180);
          this.c.translate(-this.initcenterX, -this.initcenterY);
          if(v > 0.5)
          {
            this.switch(false);
          }
        },
        (v)=>{
          this.dw += (this.nextMatrix.dw - this.dw)*v;
          this.dh += (this.nextMatrix.dh - this.dh)*v;
          this.dx += (this.nextMatrix.dx - this.dx)*v;
          this.dy += (this.nextMatrix.dy - this.dy)*v;
        }
      ])
    } 
    this[this.changeType]();
    this.c.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.timeoutCounter++;      
  }

  this.pixelated = function ()
  {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      this.pixelatedAnimation.animate([
        (o)=>c.globalAlpha=o,
        (o)=>c.globalAlpha=o
      ])
    } 
    this[this.changeType]();
    this.timeoutCounter++;  
  }

  this.slideRandom = ()=>this.slide();
  this.slideLeft = ()=>this.slide();
  this.slideRight = ()=>this.slide();
  this.slideUp = ()=>this.slide();
  this.slideDown = ()=>this.slide();

  this.slide = function () {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      this.slideAnimation.animate([
        (val)=>{
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
        },
        (val2)=>{
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
      ]);
    }
    this[this.changeType]();
    this.timeoutCounter++;
  }

  this.bubble = function() {
    this.initialise();
    if(this.timeoutCounter >= this.timeout && !this.animeDone) 
    {
      this.bubbleAnimation.animate([
        (r)=>this.radius=r,
        (r)=>this.radius=r
      ])
      c.save();
      c.beginPath();
      c.arc(this.centerX||this.initcenterX, this.centerY||this.initcenterY, this.radius, 0, Math.PI*2);
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