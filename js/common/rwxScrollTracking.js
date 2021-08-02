class rwxScrollTracking {
	constructor(){
		this.scrollEvent = this.scrollEvent.bind(this);
		this.throttle = this.throttle.bind(this);
		this.events = [];
		this.running = false;
	}

	removeEvent()
	{
		document.removeEventListener('scroll', this.throttle);
		document.removeEventListener('touchmove', this.throttle);
		document.removeEventListener('scrollTrackThrottle', this.scrollEvent);
	}

	addEvent()
	{
		document.addEventListener('scrollTrackThrottle', this.scrollEvent);
		document.addEventListener('scroll', this.throttle);
		document.addEventListener('touchmove', this.throttle);
		this.throttle();
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

	throttle()
	{
		if(this.running){return}
		this.running = true;
		window.requestAnimationFrame(()=>{
			document.dispatchEvent(new CustomEvent('scrollTrackThrottle'));
			this.running=false;
		});
	}

	scrollEvent(e)
	{
		this.events.map((ev)=>ev.ev(e));
	}
}


if(!window.rwx){window.rwx={}}
if(!window.rwx.scrollTracking){window.rwx.scrollTracking = new rwxScrollTracking()}

const add = (ev,id)=>window.rwx.scrollTracking.add(ev,id);
const remove = (id)=>window.rwx.scrollTracking.remove(id);
const rwxScrollTrack = {add, remove};

export default rwxScrollTrack;