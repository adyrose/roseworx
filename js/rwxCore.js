import rwxMisc from './helpers/rwxMiscHelpers';
class rwxCore {
	constructor(selector)
	{
		this.internalMap = {};
		this.id
		this.resourceName = this.constructor.name;		
		if(!this.execute){this.error('No execute method (this.execute) defined on instance.'); return;}
		this.execute = this.execute.bind(this);
		window.addEventListener('load', ()=>{
			if(selector)
			{
				[...document.querySelectorAll(selector)].map((el) => {
					const cpnt = this.execute(el);
					this.addIME(el.id, cpnt);
				});
			}
			else
			{
				this.execute();
			}
		});
	}

	getIMES()
	{
		return this.internalMap;
	}

	addIME(id, obj)
	{
		let toUse = id;
		if(!toUse)
		{
			toUse = rwxMisc.uniqueId();
		}
		else if(this.internalMap[toUse]){
			this.error(`Duplicate ID #${id} found. Things may not work as expected, please use unique ID's per Component.`)
		}
		this.internalMap[toUse] = obj;
	}

	getIME(id)
	{
		if(this.internalMap && this.internalMap[id])
		{
			return this.internalMap[id];
		}
		else
		{
			if(Object.keys(this.internalMap).length > 0)
			{
				this.error(`No element found with id - ${id} \n[rwx] Possible ID's on this page are - ${Object.keys(this.internalMap).join(', ')}`);
			}
			return false;
		}		
	}

	addEvent(elid, id, type, event)
	{
		if(!id || !event){return;}
		const IME = this.getIME(elid);
		if(IME && !IME.customEventsEnabled)return;
		IME && IME.addEvent(id, event, type);		
	}

	error(msg) {
		rwxError(msg, `{Core} (${this.resourceName})`)
	}
}

class rwxComponent {
	constructor(opts)
	{
		this.resourceName = this.constructor.name;
		if(opts)
		{
			if(opts.enableCustomEvents)
			{
				this.customEventsEnabled = true;
				this.availableEvents = [];
			}

			if(opts.enableAnimationLoop)
			{
				this.animateLoop = this.animateLoop.bind(this);
				this.stopAnimation = true;
			}

			if(opts.enableResizeDebounce)
			{
				this.debounceThreshold = 250;
				this.resizeDebounce();
			}

			if(opts.enableScrollIntoView)
			{
				this.stopScroll = false;
				this.setScrollTrigger(200);
				this.scrollEvent = this.scrollEvent.bind(this);
				this.scrollIntoView();
			}
		}
	}

	declareEvent(name)
	{
		this[name] = [];
		this.availableEvents.push(name);
	}

	addEvent(id, event, type)
	{
		if(!this.availableEvents.includes(type)) {
			this.error(`No custom event found with name - ${type}`)
			return;
		}
		this[type].push({id, event});
	}

	executeEvent(type, id)
	{
		if(this[type].length == 0)return;
		const changeEvents = this[type].filter((tce)=>tce.id == id);
		if(changeEvents.length == 0)return;
		changeEvents.map((ce)=>ce.event());
	}

	setScrollTrigger(val)
	{
		this.scrollTriggerOffset = window.innerHeight - val;
	}

	scrollIntoView()
	{
		this.scrollErrorReported = false;
		setTimeout(()=>{this.scrollEvent();}, 500);
		window.addEventListener('scroll', this.scrollEvent);
	}

	scrollEvent() {
		if(this.stopScroll){return;}
		if(!this.scroll)
		{
			if(!this.scrollErrorReported)
			{
				this.error('No scroll method (this.scroll) defined on instance.');
				this.scrollErrorReported = true;
			}
			return;
		}
		if(!this.el)
		{
			if(!this.scrollErrorReported)
			{
				this.error('No element (this.el) defined on instance.');
				this.scrollErrorReported = true;
			}
			return;
		}
		let t = this.el.getBoundingClientRect().top;
		if(t<this.scrollTriggerOffset)
		{
			this.scroll();
		}
	}

	resizeDebounce()
	{
		this.debounceErrorReported = false;
	  window.addEventListener('resize', ()=>{
			this.debounce && clearTimeout(this.debounce)
			this.debounce = setTimeout(()=>{
				if(!this.resize){
					if(!this.debounceErrorReported)
					{
						this.error('No resize method (this.resize) defined on instance.');
						this.debounceErrorReported = true;
					}
					return;
				}
				this.resize();
			}, this.debounceThreshold);
		});
	}

	startAnimation()
	{
		this.stopAnimation = false;
		this.animateLoop();
	}

	animateLoop()
	{
		if(!this.canvas) {
			this.error('No canvas element (this.canvas) defined on instance.');
			return;
		}
		if(!this.c) {
			this.error('No canvas 2d context (this.c) defined on instance.');
			return;
		}
		if(!this.animate) {
			this.error('No animate method (this.animate) defined on instance.');
			return;			
		}
    if(!this.stopAnimation)
    {
      requestAnimationFrame(this.animateLoop);
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.animate();    
    }
	}

	error(msg)
	{
		rwxError(msg, `{Component} (${this.resourceName})`)
	}
}

const rwxError = (err, resource) =>{
	console.warn(`[rwx] ${resource} - ${err}`)
}

export {rwxCore, rwxComponent, rwxError};