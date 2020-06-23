const rwxCanvas =
{
	scale: (canvas, context, width, height) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = (
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1
    );
    const ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }
    else {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '';
      canvas.style.height = '';
    }
    context.scale(ratio, ratio);
    return ratio;		
	},

  getQuadraticBezierLength: (x1,y1,x2,y2,x3,y3) => {
    let a, b, e, c, d, u, a1, e1, c1, d1, u1, v1x, v1y;
    v1x = x2 * 2;
    v1y = y2 * 2;
    d = x1 - v1x + x3;
    d1 = y1 - v1y + y3;
    e = v1x - 2 * x1;
    e1 = v1y - 2 * y1;
    c1 = (a = 4 * (d * d + d1 * d1));
    c1 += (b = 4 * (d * e + d1 * e1));
    c1 += (c = e * e + e1 * e1);
    c1 = 2 * Math.sqrt(c1);
    a1 = 2 * a * (u = Math.sqrt(a));
    u1 = b / u;
    a = 4 * c * a - b * b;
    c = 2 * Math.sqrt(c);
    return (a1 * c1 + u * b * (c1 - c) + a * Math.log((2 * u + u1 + c1) / (u1 + c))) / (4 * a1);
  },

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
  	if(!rwxCanvas.EasingFunctions[easing] && !this[`${id}Easing`]){
  		this[`${id}Easing`] = true;
  		console.warn(`[rwx] rwxCanvas Helpers - no '${easing}'' easing function for id - ${id}, falling back to 'linear' timing.`);
  		return 'linear';
  	}
  	return easing;
	},


	sanitizeDuration: function(duration, id) {
		if(!Number.isInteger(duration) && !this[`${id}Duration`]){ 
			this[`${id}Duration`] = true;
			console.warn(`[rwx] rwxCanvas Helpers - duration for id - ${id} must be an integer, falling back to '1000'.`);
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
    let val = rwxCanvas.EasingFunctions[easing](p);
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
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxCanvas.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxCanvas.sanitizeDuration(duration, id);}
  	let val = rwxCanvas.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
  	if(val >= 1)
  	{
  		cb();
  		delete this[`${id}Easing`];
  		delete this[`${id}Duration`];
  		return 1;
  	}
    return (from + (to - from) * val);
  },

  moveObjectAlongBezier: function(p0, p1, p2, p3, id, cb, duration, easing) {
  	if(!id)return;
  	if(!this[`${id}Easing`]){this[`${id}Easing`] = rwxCanvas.sanitizeEasing(easing, id);}
  	if(!this[`${id}Duration`]){this[`${id}Duration`] = rwxCanvas.sanitizeDuration(duration, id);}
  	let val = rwxCanvas.easingFunction(this[`${id}Easing`], this[`${id}Duration`], `${id}Ease`, cb);
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
  },

  getDistance: (p1, p2)=>{
    return Math.sqrt(Math.pow((p2.x-p1.x), 2) + Math.pow((p2.y-p1.y), 2));
  },

  isInsideCircle: (point, center, radius)=>{
    let distancesquared = (point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y);
    return distancesquared <= radius * radius;
  },

  isInsideSector: (point, center, radius, angle1, angle2)=>{
    function areClockwise(center, radius, angle, point2) {
      let point1 = {
        x : (center.x + radius) * Math.cos(angle),
        y : (center.y + radius) * Math.sin(angle)
      };
      return -point1.x*point2.y + point1.y*point2.x > 0;
    }
    let relPoint = {
      x: point.x - center.x,
      y: point.y - center.y
    };
    return !areClockwise(center, radius, angle1, relPoint) &&
           areClockwise(center, radius, angle2, relPoint) &&
           (relPoint.x*relPoint.x + relPoint.y*relPoint.y <= radius * radius);
  },

  isInsideArc: (point, center, outerRadius, angle1, angle2, innerRadius) => {
  	return (rwxCanvas.isInsideSector(point, center, outerRadius, angle1, angle2) && !rwxCanvas.isInsideCircle(point, center, innerRadius))
  },

  closestPointOnCircumference: (point, center, radius)=> {
    return {
      x: (center.x + radius * ((point.x - center.x) / Math.sqrt(Math.pow((point.x - center.x), 2) + Math.pow((point.y - center.y),2)))),
      y: (center.y + radius * ((point.y - center.y) / Math.sqrt(Math.pow((point.x - center.x), 2) + Math.pow((point.y - center.y),2))))
    }
  },

 	// not sure how to put into test
	//   resolveCollision(object, otherobject) {
	//     const xVelocityDiff = object.velocity.x - otherobject.velocity.x;
	//     const yVelocityDiff = object.velocity.y - otherobject.velocity.y;

	//     const xDist = otherobject.x - object.x;
	//     const yDist = otherobject.y - object.y;
	//     // Prevent accidental overlap of objects
	//     if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
	//         // Grab angle between the two colliding objects
	//         const angle = -Math.atan2(otherobject.y - object.y, otherobject.x - object.x);

	//         // Store mass in var for better readability in collision equation
	//         const m1 = object.mass;
	//         const m2 = otherobject.mass;

	//         // Velocity before equation
	//         const u1 = rotate(object.velocity, angle);
	//         const u2 = rotate(otherobject.velocity, angle);

	//         // Velocity after 1d collision equation
	//         const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
	//         const v2 = { x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };﻿

	//         // Final velocity after rotating axis back to original location
	//         const vFinal1 = rotate(v1, -angle);
	//         const vFinal2 = rotate(v2, -angle);

	//         // Swap object velocities for realistic bounce effect
	//         object.velocity.x = vFinal1.x;
	//         object.velocity.y = vFinal1.y;

	//         otherobject.velocity.x = vFinal2.x;
	//         otherobject.velocity.y = vFinal2.y;
	//     }
	//   },

  // not sure what it does anymore
  // getCoordsFromAngle(c1,c2,radius,angle) {
  //   return {x:c1+Math.cos(angle)*radius,y:c2+Math.sin(angle)*radius};
  // },

  //not sure what it does anymore
  // rotate(velocity, angle) {
  //   const rotatedVelocities = {
  //       x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
  //       y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  //   };
  //   return rotatedVelocities;
  // },
}
export default rwxCanvas;