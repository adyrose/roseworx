class rwxMouseTracking {
	constructor(node, ev=()=>{}){
		this.mousedEvent = this.mousedEvent.bind(this);
		this.handleOrientation = this.handleOrientation.bind(this);
		this.node = node;
		this.moused = ev;
		this.add();
	}

	add()
	{
		this.mouse = {x:0,y:0};
		this.lastmouse = {x:0,y:0};
		this.parallaxmouse = {x:0,y:0};
		this.velocity = {x:0,y:0};
		this.node.addEventListener('mousemove', this.mousedEvent);
		this.node.addEventListener('touchmove', this.mousedEvent);
		window.addEventListener('deviceorientation', this.handleOrientation);
	}

	remove()
	{
		this.node.removeEventListener('mousemove', this.mousedEvent);
		this.node.removeEventListener('touchmove', this.mousedEvent);
		window.removeEventListener('deviceorientation', this.handleOrientation);
	}

  handleOrientation(event)
  {
    let alpha = event.alpha === null ? 0 : event.alpha;
    let y = event.beta === null ? 0 : event.beta;
    let x = event.gamma === null ? 0 : event.gamma;
    if (x >  90) { x =  90};
    if (x < -90) { x = -90};
    this.parallaxmouse.x = (window.innerWidth*x/180)*4;
    this.parallaxmouse.y = (window.innerHeight*y/225)*4;  
  }

	mousedEvent(e)
	{
		this.dimensions = this.node === window ? {top:0, left:0} : this.node.getBoundingClientRect();
		let x = e.type=="touchmove" ? e.touches[0].clientX : e.clientX;
		x = x-this.dimensions.left;
		let y = e.type=="touchmove" ? e.touches[0].clientY : e.clientY;
		y = y-this.dimensions.top;
		this.mouse = {x, y};
		this.velocity = {x: ((this.mouse.x - this.lastmouse.x)/2), y: ((this.mouse.y - this.lastmouse.y)/2)};
    this.parallaxmouse.x = x- window.innerWidth/2;
    this.parallaxmouse.y = y - window.innerHeight/2; 
		this.moused();
		this.lastmouse = this.mouse;
	}
}

export default rwxMouseTracking