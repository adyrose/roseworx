import { rwxComponent } from '../rwxCore';

import {rwxParticle} from './rwxParticle';

import { rwxCanvas, rwxMath, rwxAnimate, rwxDOM, rwxMisc, rwxGeometry } from '../helpers/rwxHelpers';

import {rwxBitFont, rwxBitFontGetMatrix} from './rwxBitFont';

class rwxBitBlackHoles extends rwxBitFont {
  constructor()
  {
    super('rwx-bit-black-hole');
    this.spareColorDefault = "#FFFFFF";
  }

  execute2(el, mc, bits, orientation, shape, color, bgcolor)
  {
    let sparecolor = el.hasAttribute('data-rwx-bit-black-hole-secondary-color') ? el.getAttribute('data-rwx-bit-black-hole-secondary-color') : this.spareColorDefault;
    let disableTrail = el.hasAttribute('data-rwx-bit-black-hole-disable-trail');
    return new rwxBitBlackHole(el, mc, bits, orientation, shape, color, bgcolor, this.sanitizeColor(sparecolor, this.spareColorDefault), disableTrail);
  }
}

class rwxBitBlackHole extends rwxComponent {
  constructor(el, manualControl, bits, orientation, shape, color, bgcolor, sparecolor, disableTrail)
  {
    super({element: el, enableResizeDebounce: true, enableAnimationLoop: true, enableScrollIntoView: !manualControl, enableMouseTracking: true})
    this.el.style.backgroundColor = bgcolor;
    this.sparecolor = sparecolor;
    this.disableTrail = disableTrail;
    this.shape = shape;
    this.bits = bits;
    this.orientation = orientation;
    this.bitColor = color;
    this.backgroundColor = bgcolor;
    this.elFullSizeAbsolute();
    this.createCanvas();
    this.centerPoints = {
      x: this.width/2,
      y: this.height/2
    }
    this.dontClearRect = true;
    this.mouseRadius = 50;
    this.expandRadiusBy = 5;
    this.particles = [];
    this.initAnimationCounter = [];
    this.numberOfParticles = 700;
    this.innerParticleCountPercent = 0.5;
    this.outerParticleCountPercent = 0.4;
    this.innerRingRadiusBoundsPercentage = 0.20;
    this.outerRingRadiusBoundsPercentage = 0.25;
    this.particleRadiusLowerLimit = 1;
    this.particleRadiusUpperLimit = 3;
    this.velocityBounds = {
      inner: {
        min: 0.002,
        max: 0.003
      },
      middle: {
        min: 0.002,
        max: 0.001
      },
      outer: {
        min: 0.0009,
        max: 0.0006   
      }
    };

    this.generateLetterParticles();
    if(!this.matrix)return;
    this.isLandscape = this.width > this.height;
    this.aspectRatio = this.isLandscape ? (this.width / this.height) : (this.height / this.width);
    this.elongationToChange = this.isLandscape ? "x" : "y";
    this.innerParticleCountLimit = this.numberOfParticles * this.innerParticleCountPercent;
    this.outerParticleCountLimit = this.innerParticleCountLimit + (this.numberOfParticles * this.outerParticleCountPercent);
    this.useWidthOrHeight = this.isLandscape ? this.height/2 : this.width/2;
    this.innerRingRadiusLimit = (this.useWidthOrHeight * this.innerRingRadiusBoundsPercentage) + this.innerRingRadius;
    this.outerRingRadiusLimit = (this.useWidthOrHeight * this.outerRingRadiusBoundsPercentage) + this.innerRingRadiusLimit;
    this.maxRingRadiusLimit = this.useWidthOrHeight;
    this.generateParticles();
  }

  scrolledIntoView()
  {
    this.startAnimation();
    this.stopScroll = true;
  }

  generateLetterParticles()
  {
    this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height, 'sm');
    let letterparticles = [];
    let xs = [];
    let ys = [];
    if(!this.matrix)return;
    this.matrix.map((m)=>{
      m.matrix.map((mp)=>{
        xs.push(mp.x);
        ys.push(mp.y);
        let letterparticle = new rwxParticle(mp.x, mp.y, m.dimensions.particleSize, this.shape, this.bitColor, this.c);
        letterparticle.isLetter = true;
        letterparticle.finalx = mp.x;
        letterparticle.finaly = mp.y;
        letterparticles.push(letterparticle);
        return;
      });
      return;
    });
    let width = Math.max(...xs) - Math.min(...xs);
    let height = Math.max(...ys) - Math.min(...ys);
    this.innerRingRadius = width > height ? (width/2)+10 : (height/2)+10;
    this.calculateInnerRingPosition(letterparticles);
  }

  calculateInnerRingPosition(letterparticles)
  {
    const radian = 360/letterparticles.length;
    let coords, coords2;
    let radianCounter = 0;
    let radianCounter2 = letterparticles.length * radian;
    letterparticles.map((p, i)=>{
      coords = rwxGeometry.getCoordinatesFromAngle({x:this.centerPoints.x, y:this.centerPoints.y}, radianCounter, this.innerRingRadius);
      coords2 = rwxGeometry.getCoordinatesFromAngle({x:this.centerPoints.x, y:this.centerPoints.y}, radianCounter2, this.innerRingRadius);
      p.x = coords.x;
      p.y = coords.y;
      p.startx = coords.x;
      p.starty = coords.y;
      p.cpx = coords2.x;
      p.cpy = coords2.y;
      p.id = `letterparticle${i}`;
      radianCounter += radian;
      radianCounter2 -= radian;
      return;
    });
    this.letterparticles = letterparticles;
    this.particles.push(...letterparticles);
  }

  generateParticles()
  {
    let radius,
        color,
        rangle,
        rotationRadius,
        radians,
        velocity,
        randomElongationMultiple,
        respawnRadius,
        respawnElongation,
        elongation;
        
    for(let i=0;i<this.numberOfParticles;i++)
    {
      elongation = {
        x: 1,
        y: 1
      };
      respawnElongation = {
        x: 1,
        y: 1
      };
      radius = rwxMath.randomInt(this.particleRadiusLowerLimit, this.particleRadiusUpperLimit);   
      radians = rwxMath.randomInt(0, 360); // spawn on random point on circumference
      if(i<=this.innerParticleCountLimit)
      {
        rotationRadius = rwxMath.randomInt(this.innerRingRadius, this.innerRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.inner.min, this.velocityBounds.inner.max);
        randomElongationMultiple = rwxMath.randomFloat(0.1, 0.3);
        elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      }
      else if(i>this.innerParticleCountLimit && i <=this.outerParticleCountLimit)
      {
        rotationRadius = rwxMath.randomInt(this.innerRingRadiusLimit, this.outerRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.middle.min, this.velocityBounds.middle.max);
        randomElongationMultiple = rwxMath.randomFloat(0.3, 0.5);
        elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      }
      else
      {
        rotationRadius = rwxMath.randomInt(this.outerRingRadiusLimit, this.maxRingRadiusLimit);
        velocity = rwxMath.randomFloat(this.velocityBounds.outer.min, this.velocityBounds.outer.max);
        randomElongationMultiple = rwxMath.randomFloat(0.5, 0.7);
        
      }
      elongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * randomElongationMultiple);
      respawnElongation[this.elongationToChange] = 1 + ((this.aspectRatio - 1) * rwxMath.randomFloat(0.1, 0.7));
      respawnRadius = rwxMath.randomInt(this.innerRingRadiusLimit, this.maxRingRadiusLimit);
      let particle = new rwxParticle(0, 0, radius, 'circle', color, this.c, 1, velocity);
      particle.radians = radians;
      particle.respawnRadius = respawnRadius;
      particle.respawnElongation = respawnElongation;
      particle.rotationRadius = rotationRadius;
      particle.elongation = elongation;
      particle.colorValue = rwxMath.randomInt(1,3);
      particle.naturalSize = radius;
      if(i==0)particle.debug = true;
      this.particles.push(particle);
    }
  }

  updateParticles()
  {
    let percentage;
    for(let p of this.particles)
    {
      if(!p.isLetter)
      {
        if(p.rotationRadius > this.innerRingRadius)
        {
          p.rotationRadius -= 0.1;
        }
        else
        {
          p.rotationRadius = p.respawnRadius;
          p.elongation = p.respawnElongation;
        }
        p.radians += p.velocity;
        p.y = this.centerPoints.y + Math.sin(p.radians) * p.rotationRadius * p.elongation.y; 
        p.x = this.centerPoints.x + Math.cos(p.radians) * p.rotationRadius * p.elongation.x;

        percentage = ((p.rotationRadius-this.innerRingRadius)/(p.respawnRadius-this.innerRingRadius))*100;
        let r = (Math.floor(percentage)/100) * this.sparecolor.r;
        let g =(Math.floor(percentage)/100) * this.sparecolor.g;
        let b = (Math.floor(percentage)/100) * this.sparecolor.b;
        p.color = `rgb(${r}, ${g}, ${b})`;

        if(rwxGeometry.isInsideCircle({x:p.x, y:p.y}, this.mouseTrack.mouse, this.mouseRadius))
        {
          if(p.size <= (p.naturalSize+this.expandRadiusBy))
          {
            p.setRadius(p.size+0.5)
          }
        }
        else
        {
          if(p.size >= p.naturalSize)
          {
            p.setRadius(p.size-0.5);
          }          
        }
      }
      else
      {
        if(!p.initAnimation)
        {
          let {x,y} = rwxAnimate.fromToBezier({ x: p.startx, y: p.starty }, { x: p.cpx, y: p.cpy }, { x: p.cpx, y: p.cpy }, { x: p.finalx, y: p.finaly }, p.id, 'easeInOutQuad', 5000, () => { p.initAnimation = true; this.initAnimationCounter.push(true); if(this.initAnimationCounter.length === this.letterparticles.length){this.initAnimationDone = true;} });
          p.x = x;
          p.y = y;
        }
      }
      p.draw();
    }

  }

  resize()
  {
    this.sizeCanvas();
    this.centerPoints = {
      x: this.width/2,
      y: this.height/2
    }

    this.matrix = rwxBitFontGetMatrix(this.bits, this.orientation, this.width, this.height, 'sm');
    let counter = 0;
    this.matrix.map((m)=>{
      m.matrix.map((mp)=>{
        this.letterparticles[counter].x = mp.x;
        this.letterparticles[counter].y = mp.y;
        this.letterparticles[counter].finalx = mp.x;
        this.letterparticles[counter].finaly = mp.y;
        counter+=1;
        return;
      });
      return;
    });
  }

  animate()
  {
    this.c.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.c.fillRect(0, 0, this.width, this.height);
    this.disableTrail ? rwxCanvas.drawSector(this.c, {x:this.centerPoints.x, y:this.centerPoints.y}, this.maxRingRadiusLimit*2, rwxGeometry.toRadians(0), rwxGeometry.toRadians(360)) : rwxCanvas.drawSector(this.c, {x:this.centerPoints.x, y:this.centerPoints.y}, this.innerRingRadius+1, rwxGeometry.toRadians(0), rwxGeometry.toRadians(360));
    this.updateParticles(); 
  }
}

export default new rwxBitBlackHoles();