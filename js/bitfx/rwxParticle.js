class rwxParticle {
	constructor(x, y, size, shape, color, c, mass=1, velocity={x:0,y:0})
	{
		Object.assign(this, {x, y, size, shape, color, c, mass, velocity});
		this.setRadius(size);
	}

	setRadius(size)
	{
		this.radius = size/2;
		this.size = size;
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
		this.c.fillStyle = this.color;
		this[this.shape]();
		this.c.fill();
		this.c.closePath()
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

const rwxParticleShapes = ['square', 'circle'];

export {rwxParticle, rwxParticleShapes};