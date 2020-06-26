const rwxGeometry = {
  getQuadraticBezierLength: (p1, cp, p2) => {
    let a, b, e, c, d, u, a1, e1, c1, d1, u1, v1x, v1y;
    v1x = cp.x * 2;
    v1y = cp.y * 2;
    d = p1.x - v1x + p2.x;
    d1 = p1.y - v1y + p2.y;
    e = v1x - 2 * p1.x;
    e1 = v1y - 2 * p1.y;
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
}

export default rwxGeometry;