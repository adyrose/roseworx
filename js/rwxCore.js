import rwxMisc from './helpers/rwxMiscHelpers';
import rwxCanvas from './helpers/rwxCanvasHelpers';
import {rwxScrollTrack, rwxMouseTrack, rwxResizeTrack} from './common/rwxEventTracking';

class rwxCore {
	constructor(selector, canHaveManualControl=false)
	{
		if(selector)this.internalMap = {};
		this.resourceName = this.constructor.name;
		if(!this.execute){this.error('No execute method (this.execute) defined on instance.'); return;}
		this.execute = this.execute.bind(this);
		window.addEventListener('load', ()=>{
			if(!selector){this.execute();return;}
			this.selector = selector;
			this.canHaveManualControl = canHaveManualControl;
			[...document.querySelectorAll(this.selector)].map((el) => {
				if(this.checkMap(el)){return;}
				const mc = this.canHaveManualControl ? this.execute(el, el.hasAttribute('data-rwx-manual-control')) : this.execute(el);
				this.addIME(el.id, mc);
			});
		});
	}

	checkMap(el)
	{
		for(let im in this.internalMap){
			if(this.internalMap[im].el === el)
			{
				return true;
				break;
			}
		}
	}

	unhook(id)
	{
		if(id)
		{
			let ime = this.getIME(id);
			if(ime){
				ime.stopAnimation = true;
				ime.removeListeners && ime.removeListeners();
				ime.canvas && ime.removeCanvas();
				this.deleteIME(id);
			}
		}
	}

	hook(id)
	{
		if(id)
		{
			let el = document.getElementById(id);
			if(!el){console.log(`Element #${id} not found on page.`); return;}
			if(this.checkMap(el)){return;}
			const mc = this.canHaveManualControl ? this.execute(el, el.hasAttribute('data-rwx-manual-control')) : this.execute(el);
			this.addIME(el.id, mc);			
		}
	}

	validateParameter(value, type, caller)
	{
		if(typeof(value) !== type){this.error(`<${caller}> expected parameter of type ${type} but got ${typeof(value)}.`); return false;}
		return true;
	}

  commence(id)
  {
    const IME = this.getIME(id);
    IME && IME.scrolledIntoView();    
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
			this.error(`Duplicate ID #${id} detected. Things may not work as expected, please use unique ID's per Component.`)
		}
		this.internalMap[toUse] = obj;
	}

	deleteIME(id)
	{
		delete this.internalMap[id];
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
				this.error(`No element detected with id - ${id} \n[rwx] Possible ID's on this page are - ${Object.keys(this.internalMap).join(', ')}`);
			}
			return false;
		}		
	}

	addEvent(elid, id, type, event)
	{
		if(!id || !event || !this.validateParameter(event, 'function', 'addEvent'))return;
		const IME = this.getIME(elid);
		if(IME && !IME.customEventsEnabled)return;
		IME && IME.addEvent(id, event, type);		
	}

	error(msg) {
		rwxError(msg, `{Core} (${this.resourceName})`)
	}
}

class rwxComponent {
	constructor({element, enableCustomEvents, enableAnimationLoop, enableScrollIntoView, enableMouseTracking, enableScrollTracking, enableResizeDebounce})
	{
		this.resourceName = this.constructor.name;
		this.el = element;
		this.uniqueID = rwxMisc.uniqueId();
		if(enableCustomEvents)
		{
			this.customEventsEnabled = true;
			this.availableEvents = [];
		}

		if(enableAnimationLoop)
		{
			this.stopAnimation = true;
			this.animateLoop = this.animateLoop.bind(this);
		}

		if(enableResizeDebounce)
		{
			if(!window.rwx){window.rwx = {};}
			if(!window.rwx.resizeTracking){window.rwx.resizeTracking = new rwxResizeTrack();}
			window.rwx.resizeTracking.add(()=>this.resizeEvent(), this.uniqueID);
			this.resizeEvent = this.resizeEvent.bind(this);
		}

		if(enableScrollIntoView)
		{
			if(!window.rwx){window.rwx = {};}
			if(!window.rwx.scrollTracking){window.rwx.scrollTracking = new rwxScrollTrack();}
			window.rwx.scrollTracking.add(()=>this.scrollIntoViewEvent(), this.uniqueID);
			this.scrollIntoViewEvent = this.scrollIntoViewEvent.bind(this);
			this.setScrollTrigger(200);
			this.scrollErrorReported = false;
			window.requestAnimationFrame(this.scrollIntoViewEvent);
		}

		if(enableScrollTracking)
		{
			if(!window.rwx){window.rwx = {};}
			if(!window.rwx.scrollTracking){window.rwx.scrollTracking = new rwxScrollTrack();}
			window.rwx.scrollTracking.add(()=>this.scrollEvent(), this.uniqueID);
			this.scrollEvent = this.scrollEvent.bind(this);
			window.requestAnimationFrame(this.scrollEvent);
		}

		if(enableMouseTracking)
		{
			let fn = this.moused ? ()=>{this.moused()} : ()=>{};
			this.mouseTrack = new rwxMouseTrack(this.el, fn);
		}
	}

	removeListeners()
	{
		window.removeEventListener('resize', this.debounceEvent);
		this.mouseTrack && this.mouseTrack.remove();
		this.stopScroll();
		this.stopResize();
	}

	declareEvent(name)
	{
		this[name] = [];
		this.availableEvents.push(name);
	}

	addEvent(id, event, type)
	{
		if(!this.availableEvents.includes(type)) {
			this.error(`No custom event detected with name - ${type}`)
			return;
		}
		if(typeof(event) !== 'function'){this.error('addEvent - event parameter must be a function.'); return;}
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

	stopResize()
	{
		window.rwx.resizeTracking && window.rwx.resizeTracking.remove(this.uniqueID);
	}

	stopScroll()
	{
		window.rwx.scrollTracking && window.rwx.scrollTracking.remove(this.uniqueID);
	}

	scrollIntoViewEvent() {
		if(!this.scrolledIntoView)
		{
			if(!this.scrollErrorReported)
			{
				this.error('No scrolledIntoView method (this.scrolledIntoView) defined on instance.');
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
			this.scrolledIntoView();
		}		
	}

	scrollEvent() {
		if(!this.scroll)
		{
			if(!this.scrollError2Reported)
			{
				this.error('No scroll method (this.scroll) defined on instance.');
				this.scrollError2Reported = true;
			}
			return;			
		}
		this.scroll();
	}

	resizeEvent()
	{
		if(!this.resize){
			if(!this.debounceErrorReported)
			{
				this.error('No resize method (this.resize) defined on instance.');
				this.debounceErrorReported = true;
			}
			return;
		}
		this.resize();		
	}

	startAnimation()
	{
		this.stopAnimation = false;
		this.animateLoop();
	}

	animateLoop()
	{
		if(!this.animate) {
			this.error('No animate method (this.animate) defined on instance.');
			return;			
		}
    if(!this.stopAnimation)
    {
      requestAnimationFrame(this.animateLoop);
      (this.c && this.canvas && !this.dontClearRect) && this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.animate();    
    }
	}

	elFullSizeAbsolute()
	{
		const currentPosition = window.getComputedStyle(this.el.parentNode).position;
		if(currentPosition!=="absolute" && currentPosition!=="fixed")
		{
			this.el.parentNode.style.position = "relative";
		}
		this.el.style.position = 'absolute';
		this.el.style.top = '0px';
		this.el.style.left = '0px';
		this.el.style.right = '0px';
		this.el.style.bottom = '0px';
		this.el.style.width = '100%';
		this.el.style.height = '100%';
	}

	removeCanvas()
	{
		this.el.removeChild(this.canvas);
	}

	createCanvas()
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.el.appendChild(this.canvas);
    this.sizeCanvas();
	}

	sizeCanvas()
	{
		let meas = this.el.getBoundingClientRect();
		let pixelRatio = rwxCanvas.scale(this.canvas, this.c, this.canvasWidth || meas.width, this.canvasHeight || meas.height);
		this.width = (this.canvas.width / pixelRatio);
		this.height = (this.canvas.height / pixelRatio);
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