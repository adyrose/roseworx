require('../../scss/effects/rwxLavaLamps.scss');

import { rwxCore, rwxComponent } from '../rwxCore';

import {rwxAnimationChain} from '../modules/rwxAnimation';
import rwxMisc from '../helpers/rwxMiscHelpers';
import rwxMath from '../helpers/rwxMathHelpers';
// color can be overwrite by assigning fill on .lava-lamp path selector
class rwxLavaLamps extends rwxCore {
  constructor() {
    super({selector:'[rwx-lava-lamp]'});
    this.defaultNob = 33;
  }

  execute(el)
  {
    const nob = this.checkAttributeOrDefault(el, 'data-rwx-lava-lamp-number-of-bubbles', this.defaultNob);
    return new rwxLavaLamp(el, parseInt(nob));
  }
}

class rwxLavaLamp extends rwxComponent {
  constructor(el, nob)
  {
    super({element:el, enableAnimationLoop:true})
    this.numberOfBubbles = nob;
    this.bubbles = [];
    this.htmlDefinition();
    this.processBubbles();
    this.startAnimation();
  }

  htmlDefinition() {
    this.pathDefs = [
      "M50.2,-18.7C58.1,7.8,52.6,36.3,33.2,51.8C13.9,67.2,-19.2,69.6,-41.2,54.2C-63.2,38.8,-74,5.6,-65.3,-22.1C-56.6,-49.9,-28.3,-72.2,-3.6,-71C21.2,-69.9,42.4,-45.3,50.2,-18.7Z",
      "M60.5,-22.5C67.7,2.7,55.7,31.4,32.6,49.1C9.5,66.9,-24.6,73.8,-43.1,60.2C-61.6,46.5,-64.6,12.3,-54.8,-16.4C-45.1,-45.1,-22.5,-68.3,2,-69C26.6,-69.6,53.2,-47.8,60.5,-22.5Z",
      "M49.8,-15.6C57,6,50.1,32.7,32.5,45.8C14.9,58.9,-13.5,58.2,-34.8,43.7C-56.2,29.2,-70.5,0.8,-63.5,-20.4C-56.5,-41.6,-28.3,-55.7,-3.5,-54.6C21.3,-53.5,42.6,-37.1,49.8,-15.6Z",
      "M60.4,-31.9C73.9,-11.5,77.4,17.6,65.7,33.8C54,49.9,27,53.1,0,53.1C-26.9,53.1,-53.8,49.8,-64.5,34.3C-75.1,18.8,-69.5,-9.1,-56.1,-29.4C-42.6,-49.8,-21.3,-62.7,1.1,-63.3C23.4,-63.9,46.9,-52.3,60.4,-31.9Z",
      "M64.3,-33.8C74.9,-18.7,69.4,9.1,56,32.2C42.6,55.4,21.3,73.9,-3.3,75.8C-27.9,77.8,-55.9,63.1,-68.2,40.6C-80.4,18.1,-77.1,-12.2,-63.1,-29.3C-49.1,-46.3,-24.6,-50.1,1.1,-50.8C26.8,-51.4,53.6,-48.9,64.3,-33.8Z",
      "M52.7,-32.1C65.6,-8.1,71.5,18.3,61.5,35C51.6,51.8,25.8,59,-0.3,59.1C-26.5,59.3,-52.9,52.6,-65,34.6C-77.1,16.6,-74.9,-12.7,-61.7,-36.9C-48.5,-61.1,-24.2,-80.3,-2.2,-79.1C19.9,-77.8,39.8,-56.2,52.7,-32.1Z",
      "M72,-18.6C81.4,5.6,69,41.7,45.2,58C21.5,74.2,-13.6,70.6,-34.8,53.8C-56,37,-63.4,7,-55.2,-15.3C-47.1,-37.7,-23.6,-52.5,3.9,-53.7C31.3,-55,62.6,-42.7,72,-18.6Z",
      "M54.2,-28.8C67.8,-7.6,74.9,19.8,64.7,42.1C54.6,64.4,27.3,81.6,3.5,79.5C-20.3,77.5,-40.6,56.3,-51.4,33.7C-62.1,11,-63.4,-13.2,-53.2,-32.3C-43.1,-51.5,-21.5,-65.7,-0.6,-65.3C20.3,-64.9,40.5,-50,54.2,-28.8Z",
      "M62.5,-26.6C76.1,-12.4,79,17.4,66.8,30.7C54.6,44,27.3,40.7,1.4,39.9C-24.5,39.1,-49,40.8,-56.2,30.4C-63.4,20,-53.3,-2.5,-41.1,-15.9C-28.8,-29.3,-14.4,-33.6,5,-36.4C24.4,-39.3,48.8,-40.8,62.5,-26.6Z",
      "M57.3,-31.8C70.7,-9.8,75.7,18.4,64.8,38.3C53.8,58.3,26.9,69.9,-0.6,70.3C-28,70.6,-56.1,59.6,-67.4,39.5C-78.7,19.4,-73.2,-9.9,-59.2,-32.2C-45.1,-54.5,-22.6,-70,-0.3,-69.8C21.9,-69.6,43.8,-53.8,57.3,-31.8Z",
      "M37.7,21.5C23.5,46.4,-30.9,47.8,-43.9,23.7C-56.8,-0.5,-28.4,-50.2,-1.2,-50.9C26,-51.6,51.9,-3.3,37.7,21.5Z",
      "M46.3,-19.4C60.6,-2,73.2,23.8,65.2,41.5C57.2,59.2,28.6,68.9,6.2,65.3C-16.3,61.7,-32.6,45,-43.5,25.6C-54.4,6.2,-60,-15.8,-51.8,-29.7C-43.7,-43.5,-21.8,-49.2,-2.9,-47.5C16,-45.8,32,-36.8,46.3,-19.4Z",
      "M61.1,-34.8C74.8,-11.6,78.6,18,66.7,39.9C54.8,61.8,27.4,76.2,5.5,73C-16.5,69.9,-33,49.2,-45.9,26.7C-58.8,4.1,-68.2,-20.3,-59.9,-40.4C-51.7,-60.4,-25.8,-76.1,-1.1,-75.5C23.7,-74.9,47.4,-58,61.1,-34.8Z",
      "M51.1,-30.8C60,-14,56.9,8.5,46.4,28.6C35.8,48.6,17.9,66.1,0.6,65.8C-16.7,65.4,-33.4,47.1,-45.9,26C-58.4,4.8,-66.7,-19.3,-58.4,-35.8C-50,-52.3,-25,-61.3,-2,-60.2C21.1,-59,42.1,-47.7,51.1,-30.8Z"
    ];

    this.htmlDef = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="bubble-container"></svg>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="lava">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="lava" />
            <feBlend in="SourceGraphic" in2="lava" />
          </filter>
        </defs>
      </svg>
    `;

    let c = document.createElement('div');
    c.innerHTML = this.htmlDef;
    c.classList.add('rwx-lava-lamp-container');
    c.style.filter = "url('#lava')";
    this.elFullSizeAbsolute();
    this.addElement(this.el, c);
    this.svg = c.querySelector('.bubble-container');
  }

  processBubbles() {
    for(let i=0; i<this.numberOfBubbles; i++)
    {
      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.setAttribute("d", this.pathDefs[rwxMath.randomInt(0,this.pathDefs.length-1)]);
      this.svg.appendChild(path);
      this.bubbles.push(new Bubble(path));
    }
  }

  animate()
  {
    for(let bubble of this.bubbles)
    {
      bubble.animate();
    }
  }
}


class Bubble {
  constructor(el) {
    this.el = el;
    this.rotation = 0;
    this.skew = 0;
    this.scaleXHold = 0;
    this.scaleYHold = 0;
    this.skewHold = 0;

    this.config();
    this.animate = this.animate.bind(this);
    this.animations();
    this.animate();
  }

  config()
  {
    this.screenBoundHigh = 120;
    this.screenBoundLow = -20;

    //rotation
    this.rotationAspect = rwxMath.randomInt(0, 1) === 1 ? -rwxMath.randomFloat(0.35, 0.45) : rwxMath.randomFloat(0.35, 0.45);

    //skew
    this.skewHigh = 10;
    this.skewLow = -10;

    //scale
    this.scaleStart = 0.2;
    this.scalex = this.scaleStart;
    this.scaley = this.scaleStart;
    this.scalexHigh = 0.23;
    this.scalexLow = 0.10;
    this.scaleyHigh = 0.20;
    this.scaleyLow = 0.13;

    //translate
    this.translatex = rwxMath.randomInt(this.screenBoundLow+10, this.screenBoundHigh-10); // Spawn Position
    this.translatey = rwxMath.randomInt(this.screenBoundLow+10, this.screenBoundHigh-10); // Spawn Position
    this.speedx = rwxMath.randomFloat(0.01, 0.05);
    this.speedy = rwxMath.randomFloat(0.02, 0.06);
    let xDirection = rwxMath.randomInt(0, 1);
    this.speedx = xDirection === 1 ? -this.speedx : this.speedx;
    let yDirection = rwxMath.randomInt(0, 1);
    this.speedy = yDirection === 1 ? this.speedy : -this.speedy;
  }

  animations()
  {
    this.scaleXAnimation = new rwxAnimationChain({
      sequence: [
        {
          from: this.scaleStart,
          to: ()=>{
            let s = rwxMath.randomFloat(this.scalexLow, this.scalexHigh);
            this.scaleXHold = s;
            return s;
          },
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad',
          delay: rwxMath.randomInt(1000, 3000)
        },
        {
          from: ()=>this.scaleXHold,
          to: this.scaleStart,
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad'
        }
      ],
      loop:true
    })

    this.scaleYAnimation = new rwxAnimationChain({
      sequence: [
        {
          from: this.scaleStart,
          to: ()=>{
            let s = rwxMath.randomFloat(this.scaleyLow, this.scaleyHigh);
            this.scaleYHold = s;
            return s;
          },
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad',
          delay: rwxMath.randomInt(1000, 3000)
        },
        {
          from: ()=>this.scaleYHold,
          to: this.scaleStart,
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad'
        }
      ],
      loop:true
    })

    this.skewAnimation = new rwxAnimationChain({
      sequence: [
        {
          from: 0,
          to: ()=>{
            let s = rwxMath.randomInt(this.skewLow, this.skewHigh);
            this.skewHold = s;
            return s;
          },
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad',
          delay: rwxMath.randomInt(1000, 3000)
        },
        {
          from: ()=>this.skewHold,
          to: 0,
          duration: rwxMath.randomInt(3000, 4000),
          easing: 'easeInOutQuad'
        }
      ],
      loop:true
    })
  }

  animate()
  {
    this.scaleXAnimation.animate([(x)=>this.scalex=x,(x)=>this.scalex=x]);
    this.scaleYAnimation.animate([(y)=>this.scaley=y,(y)=>this.scaley=y]);
    this.skewAnimation.animate([(s)=>this.skew=s,(s)=>this.skew=s]);

    this.rotation += this.rotationAspect;

    if(this.translatex > this.screenBoundHigh || this.translatex < this.screenBoundLow)
    {
      this.rotationAspect = -this.rotationAspect;
      this.speedx = -this.speedx;
    }
    this.translatex += this.speedx;

    if(this.translatey > this.screenBoundHigh || this.translatey < this.screenBoundLow)
    {
      this.rotationAspect = -this.rotationAspect;
      this.speedy = -this.speedy;
    }
    this.translatey += this.speedy;

    this.el.style.transform = `translate(${this.translatex}%, ${this.translatey}%) scale(${this.scalex}, ${this.scaley}) rotate(${this.rotation}deg) skew(${this.skew}deg)`;
  }
}

export default new rwxLavaLamps();