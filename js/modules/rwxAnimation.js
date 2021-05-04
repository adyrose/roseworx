import { rwxError } from '../rwxCore';
import rwxMisc from '../helpers/rwxMiscHelpers';

const EasingFunctions = {
  linear: t => { return t },
  easeInQuad: t => { return t*t },
  easeOutQuad: t => { return t*(2-t) },
  easeInOutQuad: t => { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: t => { return t*t*t },
  easeOutCubic: t => { return (--t)*t*t+1 },
  easeInOutCubic: t => { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: t => { return t*t*t*t },
  easeOutQuart: t => { return 1-(--t)*t*t*t },
  easeInOutQuart: t => { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: t => { return t*t*t*t*t },
  easeOutQuint: t => { return 1+(--t)*t*t*t*t },
  easeInOutQuint: t => { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
  easeInElastic: t => { return (.04 - .04 / t) * Math.sin(25 * t) + 1 },
  easeOutElastic: t => { return .04 * t / (--t) * Math.sin(25 * t) },
  easeInOutElastic: t => { return (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 },
  easeOutBack: t=> {const c1 = 1.70158;const c3 = c1 + 1;return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);} 
}

const rwxAnimateHelpers = {
  easingFunction(easing, duration, variable) {
    if(!this[variable])
    {
      this[variable] = performance.now();
    }
    let p = (performance.now() - this[variable]) / duration;
    let val = EasingFunctions[easing](p);
    if (performance.now() - this[variable] > duration){
      return 1;
    }
    else
    {
      return val.toFixed(6);      
    }  
  },

  deleteVars(id)
  {
    delete this[`${id}Ease`];
  }
}

const rwxAnimate = {
  getEasingValue: function(id, easing, duration, cb=()=>{}) {
    if(!id)return;
    let val = rwxAnimateHelpers.easingFunction(easing, duration, `${id}Ease`, cb);
    let c = (easing==="easeInElastic" || easing==="easeInOutElastic" || easing==="easeOutBack") ? val===1 : val>=1;
    if(c)
    {
      cb();
      rwxAnimateHelpers.deleteVars(id);
      return 1;
    }
    return val;
  },

  fromTo: function(from, to, id, easing="linear", duration=1000, cb=()=>{}) {
  	let val = rwxAnimate.getEasingValue(id, easing, duration, cb);
    return rwxAnimate.fromToCalc(from, to, val);
  },

  fromToCalc: function(from, to, val) {
    return (from + (to - from) * val);
  },

  fromToBezier: function(p1, p2, p3, p4, id, easing="linear", duration=1000, cb=()=>{}) {
  	if(!id)return;
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxAnimateHelpers.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxAnimateHelpers.sanitizeDuration(duration, id);}
  	let val = rwxAnimateHelpers.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
    let cx = 3 * (p2.x - p1.x)
    let bx = 3 * (p3.x - p2.x) - cx;
    let ax = p4.x - p1.x - cx - bx;
    let cy = 3 * (p2.y - p1.y);
    let by = 3 * (p3.y - p2.y) - cy;
    let ay = p4.y - p1.y - cy - by;
    let x = ax*(val*val*val) + bx*(val*val) + cx*val + p1.x;
    let y = ay*(val*val*val) + by*(val*val) + cy*val + p1.y;
    if(val>=1)
    {
      rwxAnimateHelpers.deleteVars(id);
      cb();
  		return {x:p4.x, y:p4.y};
    }
  	return {x:x, y:y};
  }
}

class rwxAnimation {
  constructor({from, to, duration, easing, loop=false, complete=()=>{}})
  {
    this.loop = loop;
    this.defaultDuration = 1000;
    this.defaultEasing = 'linear';
    this.complete = complete;
    this.isComplete = false;
    this.duration = this.sanitizeDuration(duration);
    this.parse(from, to , easing);
  }

  parse(f, t, e)
  {
    this.animations = [];
    if(!Array.isArray(f)){f=[f]}
    if(!Array.isArray(t)){t=[t]}
    if(!Array.isArray(e)){e=[e]}

    f.map((from, i)=>{
      this.animations.push({
        from,
        to: Array.isArray(t) ? t[i] || t[0] : t,
        easing: this.sanitizeEasing(Array.isArray(e) ? e[i] || e[0] : e),
        id: rwxMisc.uniqueId(),
        duration: this.duration,
        isStarted: false,
        cb: ()=>{this.complete();}
      })
    });
  }

  sanitizeEasing(easing) {
    if(!EasingFunctions[easing]){
      rwxError(`No '${easing}' easing function, falling back to '${this.defaultEasing}'.`, '(rwxAnimation)');
      return this.defaultEasing;
    }
    return easing;  
  }

  sanitizeDuration(i) {
    if(!Number.isInteger(i)){ 
      rwxError(`Duration must be an integer, falling back to '${this.defaultDuration}'.`, '(rwxAnimation)');
      return this.defaultDuration;
    }
    return i;  
  }

  reset()
  {
    this.animations.map((a)=>{
    	a.isComplete=false;
    	a.isStarted=false;
    });
  }

  animate(fn)
  {
    let vals = [];
    this.animations.map((anime)=>{
    	if(!anime.isStarted)
    	{
    		anime.toUseFrom = (typeof anime.from === 'function') ? anime.from() : anime.from;
    		anime.toUseTo = (typeof anime.to === 'function') ? anime.to() : anime.to;
    	}
      let toPush = anime.isComplete ? anime.to : rwxAnimate.fromTo(anime.toUseFrom, anime.toUseTo, anime.id, anime.easing, this.duration, ()=>{
        if(!this.loop)
        {
        	anime.isComplete = true;
        	if(this.animations.every((anime)=>anime.isComplete))
        	{
        		this.complete && this.complete();
        		this.isComplete=true;
        	}
        }
      });
      anime.isStarted = true;
      vals.push(toPush);
    });
    return fn(...vals);
  }
}

class rwxAnimationChain {
  constructor({sequence, loop=false, complete=()=>{}})
  {
    this.loop = loop;
    this.seqCounter = 0;
    this.delayCounter = 0;
    this.complete = complete;
    this.parse(sequence);
  }

  reset()
  {
  	this.animations.map((a)=>a.anime.reset());
  	this.seqCounter = 0;
  	this.delayCounter = 0;
  }

  parse(seq)
  {
    this.animations = [];
    seq.map((s,i)=>{
      s.loop = false;
      let c = s.complete;
      s.complete = ()=>{
        c && c();
        if(i<seq.length-1)
        {
          this.seqCounter+=1;
          this.delayCounter=0;
        }
        else if(this.loop)
        {
          this.animations.map((a)=>{
            a.anime.reset();
          })
          this.seqCounter = 0;
        }
        else
        {
          this.complete();
        }
      };
      this.animations.push({anime:new rwxAnimation(s), delay:(s.delay/1000*60)||0});
    });
  }

  animate(fnArr)
  {
    if(this.delayCounter >= this.animations[this.seqCounter].delay)
    {
      return this.animations[this.seqCounter].anime.animate(fnArr[this.seqCounter]);
    }
    else
    {
      this.delayCounter+=1;
    }
  }
}

export {rwxAnimation, rwxAnimationChain};