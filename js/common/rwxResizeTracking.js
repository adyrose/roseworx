class rwxResizeTracking {
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

if(!window.rwx){window.rwx={}}
if(!window.rwx.resizeTracking){window.rwx.resizeTracking = new rwxResizeTracking()}

const add = (ev,id)=>window.rwx.resizeTracking.add(ev,id);
const remove = (id)=>window.rwx.resizeTracking.remove(id);
const rwxResizeTrack = {add, remove};

export default rwxResizeTrack;