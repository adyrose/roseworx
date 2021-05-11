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
  getEasingValue: function(id, easing, duration, cb) {
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

  fromTo: function(from, to, id, easing, duration, cb) {
  	let val = rwxAnimate.getEasingValue(id, easing, duration, cb);
    return rwxAnimate.fromToCalc(from, to, val);
  },

  fromToCalc: function(from, to, val) {
    return (from + (to - from) * val);
  },

  fromToBezier: function(p1, p2, p3, p4, val) {
    let c = 3 * (p2 - p1)
    let b = 3 * (p3 - p2) - c;
    let a = p4 - p1 - c - b;
    let v = a*(val*val*val) + b*(val*val) + c*val + p1;
  	return v;
  }
}

class rwxAnimation {
  constructor({from, to, control, duration, easing, loop=false, complete=()=>{}})
  {
    this.loop = loop;
    this.defaultDuration = 1000;
    this.defaultEasing = 'linear';
    this.complete = complete;
    this.progressCounter = 0;
    this.duration = this.sanitizeDuration(duration);
    this.parse(from, to , easing, control);
  }

  parse(f, t, e, c)
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
        control: c ? (Array.isArray(c) ? c[i] || c[0] : c) : null,
        id: rwxMisc.uniqueId(),
        duration: this.duration,
        isStarted: false,
        isComplete: false,
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
  	this.progressCounter = 0;
  	this.isComplete = false;
    this.animations.map((a)=>{
    	a.isComplete=false;
    	a.isStarted=false;
    });
  }

  getProgress()
  {
  	return (this.progressCounter/60)*100;
  }

  getEasingValue()
  {
  	return this.easingValue;
  }

  animate(fn)
  {
    let vals = [];
    this.animations.map((anime)=>{
    	if(!anime.isStarted)
    	{
    		anime.toUseFrom = (typeof anime.from === 'function') ? anime.from() : anime.from;
    		anime.toUseTo = (typeof anime.to === 'function') ? anime.to() : anime.to;
    		if(anime.control)
    		{
    			anime.tucp1 = (typeof anime.control.cp1 === 'function') ? anime.control.cp1() : anime.control.cp1;
    			anime.tucp2 = (typeof anime.control.cp2 === 'function') ? anime.control.cp2() : anime.control.cp2;
    		}
    		anime.isStarted = true;
    	}
    	this.easingValue = anime.isComplete ? 1 : rwxAnimate.getEasingValue(anime.id, anime.easing, this.duration, ()=>{
        if(!this.loop)
        {
        	anime.isComplete = true;
        	if(this.animations.every((anime)=>anime.isComplete))
        	{
        		this.complete && window.requestAnimationFrame(()=>this.complete());
        		this.isComplete=true;
        	}
        }
        else
        {
        	window.requestAnimationFrame(()=>this.reset());
        }
    	});
      let toPush = anime.isComplete ? anime.toUseTo : anime.control ? rwxAnimate.fromToBezier(anime.toUseFrom, anime.tucp1, anime.tucp2, anime.toUseTo, this.easingValue) : rwxAnimate.fromToCalc(anime.toUseFrom, anime.toUseTo, this.easingValue);
      vals.push(toPush);
    });
    if(this.progressCounter<(this.duration/1000*60)){this.progressCounter+=1;}
    if(!this.isComplete){
    	if(fn)return fn(...vals);
    }
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

  stop()
  {
    this.stopNow=true;
  }

  reset()
  {
   	this.seqCounter = 0;
  	this.delayCounter = 0; 	
  	this.animations.map((a)=>a.anime.reset());
  }

  parse(seq)
  {
    this.animations = [];
    seq.map((s,i)=>{
    	if(i>0 && s.from===undefined){s.from = seq[i-1].to}
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
          window.requestAnimationFrame(()=>this.reset());
        }
        else
        {
          window.requestAnimationFrame(()=>this.complete());
        }
      };
      this.animations.push({anime:new rwxAnimation(s), delay:(s.delay/1000*60)||0});
    });
  }

  animate(fnArr)
  {
    if(this.stopNow){return;}
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

export {rwxAnimation, rwxAnimationChain, rwxAnimate};