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
}

export default rwxGeometry;