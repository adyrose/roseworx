class rwxParticle {
	constructor(x, y, size, shape, c)
	{
		Object.assign(this, {x, y, size, shape, c});
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
		this[this.shape]();
		this.c.fill();
		this.c.closePath()
	}

	square()
	{
		this.c.rect((this.x-(this.size/2)), (this.y-(this.size/2)), this.size, this.size);
	}

	circle()
	{
		this.c.arc(this.x, this.y, this.size/2, 0, 2 * Math.PI);
	}
}

const rwxParticleShapes = ['square', 'circle'];

export {rwxParticle, rwxParticleShapes};