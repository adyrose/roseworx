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

  drawSector: (ctx, center, radius, startAngle, endAngle) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius/2, startAngle, endAngle);
    ctx.lineWidth = radius;
    ctx.stroke();
    ctx.closePath();
  },

  drawArc: (ctx, center, radius, depth, startAngle, endAngle) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, (radius-(depth/2)), startAngle, endAngle);
    ctx.lineWidth = depth;
    ctx.stroke();
    ctx.closePath();    
  }

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