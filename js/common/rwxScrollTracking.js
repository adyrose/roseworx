class rwxScrollTracking {
	constructor(){
		this.scrollEvent = this.scrollEvent.bind(this);
		this.events = [];
		this.running = false;
	}

	removeEvent()
	{
		document.removeEventListener('scroll', this.scrollEvent);
		document.removeEventListener('touchmove', this.scrollEvent);
		document.removeEventListener('scrollTrackThrottle', this.scrollEvent);
	}

	addEvent()
	{
		document.addEventListener('scrollTrackThrottle', this.scrollEvent);
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
		document.addEventListener('scroll', this.scrollEvent);
		document.addEventListener('touchmove', this.scrollEvent);
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