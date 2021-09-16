import {rwxAnimation} from './rwxAnimation';
import rwxDOM from '../helpers/rwxDOMHelpers';
require('../../scss/modules/rwxSkrollHighjack.scss');

class rwxSkrollHighjack {
	constructor(navigation=true, ignore, scrollCallback)
	{
		this.resourceName = "rwxSkrollHighjack";
		this.fn = scrollCallback;
		this.ignore = ignore;
		this.hasNavigation = navigation;
		this.index = 0;
		this.counters = [];
		this.highjacked = false;
		this.stopAnimation = false;
		this.m = [...document.querySelectorAll('[data-rwx-skroll-highjack-section]')];
		if(this.m.length===0)return;
		this.unloadEvent();
		this.createAnimation();
		document.body.style.overflow = "hidden";
		this.clonedEvents = [...window.rwx.scrollTracking.events];
		window.rwx.scrollTracking.events = [];
		this.animate = this.animate.bind(this);
		this.hasNavigation && this.htmlDefinition();
		this.immediate();

		this.scrolling = this.scrolling.bind(this);
		document.addEventListener('wheel', this.scrolling);
		
		window.addEventListener('beforeunload', this.unloadEvent);
		
		this.closeNavEvent = this.closeNavEvent.bind(this);
		this.hasNavigation && document.addEventListener('click', this.closeNavEvent);
		
		this.catchTabs = this.catchTabs.bind(this);
		window.addEventListener('keyup', this.catchTabs);
	}

	catchTabs(e)
	{
		if(e.keyCode===9)
		{
			const anc = rwxDOM.hasAncestor(e.target, '[data-rwx-skroll-highjack-section]')
			if(anc)
			{
				const newIndex = this.m.findIndex((m)=>m===anc);
				this.index = newIndex+1;
				this.activeCounter();
			}
		}
	}

	closeNavEvent()
	{
		this.navigation.classList.remove('active');
	}

	unloadEvent()
	{
		window.scrollTo(0,0);
	}

	unhook(replaceEvents=true)
	{
		window.removeEventListener('beforeunload', this.unloadEvent);
		if(replaceEvents)window.rwx.scrollTracking.events = this.clonedEvents;
		document.body.style.overflow = "";
		document.removeEventListener('wheel', this.scrolling);
		if(this.hasNavigation)
		{
			document.body.removeChild(this.navigation);
			document.removeEventListener('click', this.closeNavEvent);
		}
	}

	htmlDefinition()
	{
		this.navigation = document.createElement('div');
		this.navigation.setAttribute('tabIndex', 0);
		this.navigation.classList.add('skroll-highjack-navigation');
		this.m.map((m, i)=>{
			let title = m.hasAttribute('data-rwx-skroll-highjack-section-title') ? m.getAttribute('data-rwx-skroll-highjack-section-title') : "";
			let container = document.createElement('div');
			container.classList.add('skroll-highjack-navigation-counter-container');
			container.addEventListener('click', ()=>{
				this.navigation.offsetWidth > 32 && this.goTo(i+1);
			});
			let counter = document.createElement('div');
			counter.classList.add('skroll-highjack-navigation-counter');
			this.addCounterAttributes(counter, title);
			this.addCounterEvents(counter, i, this.m.length);
			let text = document.createElement('span');
			text.innerText = title;
			container.appendChild(counter);
			container.appendChild(text);
			this.navigation.appendChild(container);
			this.counters.push(counter);
		});
		document.body.insertBefore(this.navigation, document.body.children[0]);
		this.navigation.focus();
	}

	addCounterAttributes(counter, text)
	{
		counter.setAttribute('tabIndex', 0);
		counter.setAttribute('role', 'button');
		counter.setAttribute('aria-label', text);
		counter.setAttribute('title', text);
	}

	addCounterEvents(counter, i, length)
	{
		counter.addEventListener('keydown', (ev)=>{
			if(ev.keyCode == 13 || ev.keyCode == 32)
			{
				ev.preventDefault();
				this.goTo(i+1)
			}
		});
		counter.addEventListener('focus', ()=>{
			this.nextFocus = i;
			this.navigation.classList.add('active');
		});
		counter.addEventListener('blur', ()=>{
			setTimeout(()=>{
				if((i===0 && this.nextFocus !==1) || (i===length-1 && this.nextFocus !== length-2))this.navigation.classList.remove('active');
			}, 100);
		});
	}

	animate()
	{
		if(!this.highjacked)return;
		this.animation.animate((y)=>{
			window.scrollTo(0, y);
			this.fn && this.fn(y);
			this.clonedEvents.map((ev)=>ev.ev());
		})
		window.requestAnimationFrame(this.animate);
	}

	goTo(t)
	{
		let newIndex = false;
		if(typeof t === "number" && t<=this.m.length && t>0)
		{
			newIndex = t;
		}
		else if(typeof t === "string")
		{
			let found = this.m.findIndex((m)=>m.id===t);
			if(found!==-1)newIndex=found+1;
		}
		if(newIndex===false || newIndex===this.index)return;
		this.animation.reset();
		this.index = newIndex;
		this.highjacked = true;
		this.activeCounter();
		this.animate();
	}

	activeCounter()
	{
		if(this.hasNavigation)
		{
			this.counters.map((c, i)=> i===this.index-1 ? c.classList.add('active') : c.classList.remove('active'));
		}
	}

	immediate()
	{
		if(window.location.hash)
		{
			const touse = window.location.hash.replace('#', '');
			const filtered = this.m.filter((m)=>m.id===touse);
			if(filtered.length > 0)
			{
				const newIndex = this.m.findIndex((m)=>m.id===touse);
				const newTop = filtered[0].getBoundingClientRect().top;
				this.index = newIndex+1;
				this.activeCounter();
				window.requestAnimationFrame(()=>{
					window.scrollTo(0, newTop);
					this.fn && this.fn(newTop);
					this.clonedEvents.map((ev)=>ev.ev());
				})		
			}
		}
	}

	getTop()
	{
		if(this.index===0)return 0;
		let val = (this.m[this.index-1].getBoundingClientRect().top + window.pageYOffset)
		if(val > (document.body.scrollHeight-window.innerHeight))
		{
			val = (document.body.scrollHeight-window.innerHeight);
		}
		return val;
	}

	createAnimation()
	{
		this.animation = new rwxAnimation({
			from:()=>window.pageYOffset,
			to: ()=>this.getTop(),
			easing: 'easeOutQuad',
			duration: 1000,
			complete: ()=>{this.highjacked=false;}
		});
	}

	scrolling(e)
	{
		if(this.highjacked || e.type!=="wheel"){return}
		if(this.ignore)
		{
			let toreturn = false;
			this.ignore.filter((sc)=>(sc.scrollHeight > sc.offsetHeight || sc.scrollWidth > sc.offsetWidth)).map((i)=>{
				if(e.target === i || i.contains(e.target))
				{
					toreturn=true;
				}
				return false;
			})
			if(toreturn)return;
		}

		this.animation.reset();
		if(event.deltaY < 0)
		{
			if(this.index===0){return;}
			this.index -=1;
		}
		else if(event.deltaY > 0)
		{
			if(this.index===this.m.length){return;}
			this.index +=1;
		}
		this.highjacked = true;
		this.activeCounter();
		this.animate();
	}
}

export default rwxSkrollHighjack;