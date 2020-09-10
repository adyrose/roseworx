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
  },

  // not sure what it does anymore
  // getCoordsFromAngle(c1,c2,radius,angle) {
  //   return {x:c1+Math.cos(angle)*radius,y:c2+Math.sin(angle)*radius};
  // },
}
export default rwxCanvas;