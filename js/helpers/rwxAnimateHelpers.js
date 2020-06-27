const rwxAnimateHelpers = {
  EasingFunctions: {
    linear: function (t) { return t },
    easeInQuad: function (t) { return t*t },
    easeOutQuad: function (t) { return t*(2-t) },
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    easeInCubic: function (t) { return t*t*t },
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    easeInQuart: function (t) { return t*t*t*t },
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    easeInQuint: function (t) { return t*t*t*t*t },
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
  },

  sanitizeEasing(easing, id) {
    if(!rwxAnimateHelpers.EasingFunctions[easing] && !this[`${id}Easing`]){
      this[`${id}Easing`] = true;
      console.warn(`[rwx] rwxAnimate Helpers - no '${easing}'' easing function for id - ${id}, falling back to 'linear' timing.`);
      return 'linear';
    }
    return easing;  
  },

  sanitizeDuration(duration, id) {
    if(!Number.isInteger(duration) && !this[`${id}Duration`]){ 
      this[`${id}Duration`] = true;
      console.warn(`[rwx] rwxAnimate Helpers - duration for id - ${id} must be an integer, falling back to '1000'.`);
      return 1000;
    }
    return duration;  
  },

  easingFunction(easing, duration, variable) {
    if(!this[variable])
    {
      this[variable] = performance.now();
    }
    let p = (performance.now() - this[variable]) / duration;
    let val = rwxAnimateHelpers.EasingFunctions[easing](p);
    if (performance.now() - this[variable] > duration){
      return 1;
    }
    else
    {
      return val.toFixed(8);      
    }  
  },

  deleteVars(id)
  {
    delete this[`${id}Easing`];
    delete this[`${id}Duration`];
    delete this[`${id}Ease`];
  }
}

const rwxAnimate = {
  fromTo: function(from, to, id, easing="linear", duration=1000, cb=()=>{}) {
  	if(!id)return;
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxAnimateHelpers.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxAnimateHelpers.sanitizeDuration(duration, id);}
  	let val = rwxAnimateHelpers.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
  	if(val >= 1)
  	{
      cb();
  		rwxAnimateHelpers.deleteVars(id);
      return parseInt(to);
  	}
    return (from + (to - from) * val);
  },

  fromToBezier: function(p1, p2, p3, p4, id, easing, duration, cb) {
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

export default rwxAnimate;