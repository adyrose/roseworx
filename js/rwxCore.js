import rwxMisc from './helpers/rwxMiscHelpers';
import rwxCanvas from './helpers/rwxCanvasHelpers';
import rwxResizeTrack from './common/rwxResizeTracking';
import rwxScrollTrack from './common/rwxScrollTracking';
import rwxMouseTrack from './common/rwxMouseTracking';

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
				const ismc = this.checkAttributeForBool(el, 'data-rwx-manual-control');
				const mc = this.canHaveManualControl ? this.execute(el, ismc) : this.execute(el);
				mc && this.addIME(el.id, mc);
			});
		});
	}

	checkAttributeOrDefault(el, att, def)
	{
		return el.hasAttribute(att) ? el.getAttribute(att) : def;
	}

	checkAttributeForBool(el, att)
	{
		return el.hasAttribute(att) ? el.getAttribute(att) === "false" ? false : true : false;
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
			let ime = this.getIME(id, true);
			if(ime){
				ime.stopAnimation = true;
				ime.removeListeners && ime.removeListeners();
				ime.removeElements && ime.removeElements();
				ime.removeStyles && ime.removeStyles();
				ime.cleanUp && ime.cleanUp();
				this.deleteIME(id);
			}
		}
	}

	hook(id)
	{
		if(id)
		{
			let el = document.getElementById(id);
			if(!el){this.error(`Hook - Element #${id} not found on page.`); return;}
			if(this.checkMap(el)){return;}
			const mc = this.canHaveManualControl ? this.execute(el, this.checkAttributeForBool(el, 'data-rwx-manual-control')) : this.execute(el);
			mc && this.addIME(el.id, mc);			
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
  	if(IME)
  	{
  		if(IME.hasScrolled)
  		{
  			IME.animate && IME.startAnimation();
  		}
  		else
  		{
  			IME.scrolledIntoView(); 
  		}
  	}   
  }

  uncommence(id)
  {
    const IME = this.getIME(id);
  	if(IME)
  	{
  		IME.stopAnimation = true;
  		IME.startedAnimation = false;
  	}  	
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

	getIME(id, noerr=false)
	{
		if(this.internalMap && this.internalMap[id])
		{
			return this.internalMap[id];
		}
		else
		{
			if(Object.keys(this.internalMap).length > 0 && !noerr)
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
		this.addedElements = [];
		this.addedStyles = [];
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
			rwxResizeTrack.add(()=>this.resizeEvent(), this.uniqueID);
			this.resizeEvent = this.resizeEvent.bind(this);
		}

		if(enableScrollIntoView)
		{
			rwxScrollTrack.add(()=>this.scrollIntoViewEvent(), this.uniqueID);
			this.scrollIntoViewEvent = this.scrollIntoViewEvent.bind(this);
			this.setScrollTrigger(200);
			this.scrollErrorReported = false;
			window.requestAnimationFrame(this.scrollIntoViewEvent);
		}

		if(enableScrollTracking)
		{
			rwxScrollTrack.add(()=>this.scrollEvent(), this.uniqueID);
			this.scrollEvent = this.scrollEvent.bind(this);
			window.requestAnimationFrame(this.scrollEvent);
		}

		if(enableMouseTracking)
		{
			let fn = this.moused ? (e)=>{this.moused(e)} : ()=>{};
			this.mouseTrack = new rwxMouseTrack(this.el.hasAttribute('rwx-mouse-track-use-window') ? window : this.el, fn);
		}
	}

	removeElements()
	{
		this.addedElements.map((a)=>a.parent.removeChild(a.child));
		this.addedElements = [];
	}

	removeElement(parent, child)
	{
		parent.removeChild(child);
		this.addedElements = this.addedElements.filter((ae)=>ae.parent!==parent && ae.child!==child);
	}

	addElement(parent, child)
	{
		parent.appendChild(child);
		this.addedElements.push({parent, child});
	}

	addStyle(parent, style, val)
	{
		parent.style[style] = val;
		this.addedStyles.push({parent, style});
	}

	removeStyles()
	{
		this.addedStyles.map((s)=>s.parent.style[s.style] = '');
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
		this.hasResized = true;
		window.rwx.resizeTracking && window.rwx.resizeTracking.remove(this.uniqueID);
	}

	stopScroll()
	{
		this.hasScrolled = true;
		window.rwx.scrollTracking && window.rwx.scrollTracking.remove(this.uniqueID);
	}

	scrollIntoViewEvent() {
		if(this.hasScrolled)return;
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
		if(this.hasScrolled)return;
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
		if(this.hasResized)return;
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
		if(!this.startedAnimation)
		{
			this.startedAnimation = true;
			this.animateLoop();
		}
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

	elFullSizeAbsolute(color)
	{
		const currentPosition = window.getComputedStyle(this.el.parentNode).position;
		if(currentPosition!=="absolute" && currentPosition!=="fixed")
		{
			this.addStyle(this.el.parentNode, 'position', 'relative');
		}
		this.addStyle(this.el, 'position', 'absolute');
		this.addStyle(this.el, 'top', '0px');
		this.addStyle(this.el, 'left', '0px');
		this.addStyle(this.el, 'right', '0px');
		this.addStyle(this.el, 'bottom', '0px');
		this.addStyle(this.el, 'width', '100%');
		this.addStyle(this.el, 'height', '100%');
		this.addStyle(this.el, 'overflow', 'hidden');
		if(color)this.addStyle(this.el, 'backgroundColor', color);
	}

	createCanvas()
	{
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		this.addElement(this.el, this.canvas);
    this.sizeCanvas();
	}

	sizeCanvas()
	{
		let meas = this.el.getBoundingClientRect();
		const {pixelRatio, width, height} = rwxCanvas.scale(this.canvas, this.c, this.canvasWidth || meas.width, this.canvasHeight || meas.height);
		this.pixelRatio = pixelRatio;
		this.width = width;
		this.height = height;
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