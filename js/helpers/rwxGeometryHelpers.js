const rwxGeometry = {
  toRadians: (degree) => {return (degree * Math.PI / 180);},
  getQuadraticBezierLength: (sp, cp, ep) => {
    let a, b, e, c, d, u, a1, e1, c1, d1, u1, v1x, v1y;
    v1x = cp.x * 2;
    v1y = cp.y * 2;
    d = sp.x - v1x + ep.x;
    d1 = sp.y - v1y + ep.y;
    e = v1x - 2 * sp.x;
    e1 = v1y - 2 * sp.y;
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
  
  getAngle(centerX, centerY, posX, posY) {
    // returns an objects angle based on its coordinates and a center point
    let x = centerX - posX;
    let y = centerY - posY;

    let theta = Math.atan2(-y, -x);
    theta *= 180 / Math.PI;
    if (theta < 0) theta += 360;
    return theta;
  },

  getDistance: (p1, p2)=>{
    return Math.sqrt(Math.pow((p2.x-p1.x), 2) + Math.pow((p2.y-p1.y), 2));
  },

  isInsideCircle: (p, center, radius)=>{
    let distancesquared = (p.x - center.x) * (p.x - center.x) + (p.y - center.y) * (p.y - center.y);
    return distancesquared <= radius * radius;
  },

  isInsideSector: (p, center, radius, angle1, angle2)=>{
    function areClockwise(center, radius, angle, point2) {
      let point1 = {
        x : (center.x + radius) * Math.cos(angle),
        y : (center.y + radius) * Math.sin(angle)
      };
      return -point1.x*point2.y + point1.y*point2.x > 0;
    }
    let relPoint = {
      x: p.x - center.x,
      y: p.y - center.y
    };
    return !areClockwise(center, radius, angle1, relPoint) &&
           areClockwise(center, radius, angle2, relPoint) &&
           (relPoint.x*relPoint.x + relPoint.y*relPoint.y <= radius * radius);
  },

  isInsideArc: (p, center, outerRadius, innerRadius, angle1, angle2) => {
  	return (rwxGeometry.isInsideSector(p, center, outerRadius, angle1, angle2) && !rwxGeometry.isInsideCircle(p, center, innerRadius))
  },

  closestPointOnCircumference: (p, center, radius)=> {
    return {
      x: (center.x + radius * ((p.x - center.x) / Math.sqrt(Math.pow((p.x - center.x), 2) + Math.pow((p.y - center.y),2)))),
      y: (center.y + radius * ((p.y - center.y) / Math.sqrt(Math.pow((p.x - center.x), 2) + Math.pow((p.y - center.y),2))))
    }
  },
  
  // o = {x, y, mass, radius, velocity:{x, y}}
  resolveCollision: (o, o2, dontUpdateSecondObject=false) => {
    if((rwxGeometry.getDistance({x:o.x, y:o.y}, {x:o2.x, y:o2.y}) - o.radius - o2.radius) <= 0)
    {
      const xVelocityDiff = o.velocity.x - o2.velocity.x;
      const yVelocityDiff = o.velocity.y - o2.velocity.y;

      const xDist = o2.x - o.x;
      const yDist = o2.y - o.y;
      if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(o2.y - o.y, o2.x - o.x);

        const u1 = rwxGeometry.rotateVelocities(o.velocity, angle);
        const u2 = rwxGeometry.rotateVelocities(o2.velocity, angle);

        const v1 = { x: u1.x * (o.mass - o2.mass) / (o.mass + o2.mass) + u2.x * 2 * o2.mass / (o.mass + o2.mass), y: u1.y };
        const v2 = { x: u2.x * (o2.mass - o.mass) / (o.mass + o2.mass) + u1.x * 2 * o2.mass / (o.mass + o2.mass), y: u2.y };﻿

        const vFinal1 = rwxGeometry.rotateVelocities(v1, -angle);
        const vFinal2 = rwxGeometry.rotateVelocities(v2, -angle);

        o.velocity.x = vFinal1.x;
        o.velocity.y = vFinal1.y;
        if(!dontUpdateSecondObject)
        {
          o2.velocity.x = vFinal2.x;
          o2.velocity.y = vFinal2.y;
        }
      }
    }
  },

  rotateVelocities: (velocity, angle) => {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
  },
}

export default rwxGeometry;