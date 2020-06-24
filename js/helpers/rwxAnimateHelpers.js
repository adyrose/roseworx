const rwxAnimate = {
	EasingFunctions: {
		// no easing, no acceleration
		linear: function (t) { return t },
		// accelerating from zero velocity
		easeInQuad: function (t) { return t*t },
		// decelerating to zero velocity
		easeOutQuad: function (t) { return t*(2-t) },
		// acceleration until halfway, then deceleration
		easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
		// accelerating from zero velocity
		easeInCubic: function (t) { return t*t*t },
		// decelerating to zero velocity
		easeOutCubic: function (t) { return (--t)*t*t+1 },
		// acceleration until halfway, then deceleration
		easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
		// accelerating from zero velocity
		easeInQuart: function (t) { return t*t*t*t },
		// decelerating to zero velocity
		easeOutQuart: function (t) { return 1-(--t)*t*t*t },
		// acceleration until halfway, then deceleration
		easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
		// accelerating from zero velocity
		easeInQuint: function (t) { return t*t*t*t*t },
		// decelerating to zero velocity
		easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
		// acceleration until halfway, then deceleration
		easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
	},

	sanitizeEasing: function(easing, id) {
  	if(!rwxAnimate.EasingFunctions[easing] && !this[`${id}Easing`]){
  		this[`${id}Easing`] = true;
  		console.warn(`[rwx] rwxAnimate Helpers - no '${easing}'' easing function for id - ${id}, falling back to 'linear' timing.`);
  		return 'linear';
  	}
  	return easing;
	},


	sanitizeDuration: function(duration, id) {
		if(!Number.isInteger(duration) && !this[`${id}Duration`]){ 
			this[`${id}Duration`] = true;
			console.warn(`[rwx] rwxAnimate Helpers - duration for id - ${id} must be an integer, falling back to '1000'.`);
			return 1000;
		}
		return duration;
	},

  easingFunction: function(easing, duration, variable) {
    if(!this[variable])
    {
      this[variable] = performance.now();
    }
    let p = (performance.now() - this[variable]) / duration;
    let val = rwxAnimate.EasingFunctions[easing](p);
    if (performance.now() - this[variable] > duration){
      delete this[variable];
      return 1;
    }
    else
    {
      return val.toFixed(8);      
    }
  },

  fromTo: function(from, to, id, easing="linear", duration=1000, cb=()=>{}) {
  	if(!id)return;
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxAnimate.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxAnimate.sanitizeDuration(duration, id);}
  	let val = rwxAnimate.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
  	if(val >= 1)
  	{
  		cb();
  		delete this[`${id}Easing`];
  		delete this[`${id}Duration`];
  		return parseInt(to);
  	}
    return (from + (to - from) * val);
  },

  moveObjectAlongBezier: function(p0, p1, p2, p3, id, cb, duration, easing) {
  	if(!id)return;
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxAnimate.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxAnimate.sanitizeDuration(duration, id);}
  	let val = rwxAnimate.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
    let cx = 3 * (p1.x - p0.x)
    let bx = 3 * (p2.x - p1.x) - cx;
    let ax = p3.x - p0.x - cx - bx;
    let cy = 3 * (p1.y - p0.y);
    let by = 3 * (p2.y - p1.y) - cy;
    let ay = p3.y - p0.y - cy - by;
    let x = ax*(val*val*val) + bx*(val*val) + cx*val + p0.x;
    let y = ay*(val*val*val) + by*(val*val) + cy*val + p0.y;
    if(val>=1)
    {
      cb();
      delete this[`${id}Easing`];
  		delete this[`${id}Duration`];
  		return {x:p3.x, y:p3.y};
    }
  	return {x:x, y:y};
  }
}

export default rwxAnimate;