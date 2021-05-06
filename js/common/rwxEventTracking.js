class rwxResizeTrack {
	constructor()
	{
		this.debounceEvent = this.debounceEvent.bind(this);
		this.events = [];
		this.debounceThreshold = 250;
	}

	removeEvent()
	{
		window.removeEventListener('resize', this.debounceEvent);
	}

	addEvent()
	{
		window.addEventListener('resize', this.debounceEvent);
	}

	remove(id){
		this.events = this.events.filter((ev)=>ev.id!==id);
		if(this.events.length === 0)
		{
			this.removeEvent();
		}
	}

	add(ev, id)
	{
		if(this.events.length===0)
		{
			this.addEvent();
		}
		this.events.push({ev,id});
	}

	debounceEvent()
	{
		this.debounce && clearTimeout(this.debounce)
		this.debounce = setTimeout(()=>{
			this.events.map((ev)=>ev.ev());
		}, this.debounceThreshold);
	}
}

class rwxScrollTrack {

	constructor(){
		this.scrollEvent = this.scrollEvent.bind(this);
		this.events = [];
	}

	removeEvent()
	{
		document.removeEventListener('wheel', this.scrollEvent, { capture: true, passive: true});
	}

	addEvent()
	{
		document.addEventListener('wheel', this.scrollEvent, { capture: true, passive: true});
	}

	remove(id){
		this.events = this.events.filter((ev)=>ev.id!==id);
		if(this.events.length === 0)
		{
			this.removeEvent();
		}
	}

	add(ev, id)
	{
		if(this.events.length===0)
		{
			this.addEvent();
		}
		this.events.push({ev,id});
	}

	scrollEvent()
	{
		this.events.map((ev)=>ev.ev());
	}
}

class rwxMouseTrack {
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
		this.dimensions = this.node.getBoundingClientRect();
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

export {rwxScrollTrack, rwxMouseTrack, rwxResizeTrack};