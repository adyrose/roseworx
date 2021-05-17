import { rwxMisc } from '../helpers/rwxHelpers';

class rwxParticle {
	constructor(x, y, size, shape, color, c, mass=1, velocity={x:0,y:0})
	{
		shape = shape === "mixed" ? rwxMisc.randomValueFromArray(rwxParticleShapes.filter((ps)=>ps!=="mixed")) : shape;
		Object.assign(this, {x, y, size, shape, color, c, mass, velocity});
		this.setRadius(size);
		this.fill = shape==="cross" ? false : true;
		this.stroke = shape==="cross" ? true : false;
	}

	setStroke(ts)
	{
		this.stroke = ts;
	}

	setFill(tf)
	{
		this.fill = tf;
	}

	setRadius(size)
	{
		this.radius = size/2;
		this.size = size;
	}

	refresh(x,y)
	{
		this.x=x;
		this.y=y;
	}

	update(x, y)
	{
		this.x = x;
		this.y = y;
		this.draw();
	}

	draw()
	{
		this.c.beginPath();
		if(this.stroke)
		{
			this.c.strokeStyle = this.color;
		}
		if(this.fill)
		{
			this.c.fillStyle = this.color;
		}
		this[this.shape]();
		this.c.closePath();
		if(this.stroke)this.c.stroke();
		if(this.fill)this.c.fill();
	}

	cross()
	{
		this.c.moveTo(this.x-this.radius, this.y-this.radius);
		this.c.lineTo(this.x+this.radius, this.y+this.radius);
		this.c.moveTo(this.x-this.radius, this.y+this.radius);
		this.c.lineTo(this.x+this.radius, this.y-this.radius);
	}

	diamond()
	{
		this.c.moveTo(this.x, this.y-this.radius);
		this.c.lineTo(this.x+(this.size/3), this.y);
		this.c.lineTo(this.x, this.y+this.radius);
		this.c.lineTo(this.x-(this.size/3), this.y);
		this.c.lineTo(this.x, this.y-this.radius);
	}

	pentagon()
	{
		this.c.moveTo(this.x, this.y-this.radius);
		this.c.lineTo(this.x+this.radius, this.y-(this.size/14));
		this.c.lineTo(this.x+(this.size/4), this.y+this.radius);
		this.c.lineTo(this.x-(this.size/4), this.y+this.radius);
		this.c.lineTo(this.x-this.radius, this.y-(this.size/14));
		this.c.lineTo(this.x, this.y-this.radius);
	}

	triangle()
	{
		this.c.moveTo(this.x, this.y-this.radius);
		this.c.lineTo((this.x+this.size), (this.y+this.size));
		this.c.lineTo((this.x-this.size), (this.y+this.size));
		this.c.lineTo(this.x, this.y-this.radius)
	}

	square()
	{
		this.c.rect((this.x-(this.radius)), (this.y-(this.radius)), this.size, this.size);
	}

	circle()
	{
		this.c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	}
}

const rwxParticleShapes = ['square', 'circle', 'triangle', 'pentagon', 'diamond', 'cross', 'mixed'];

export {rwxParticle, rwxParticleShapes};