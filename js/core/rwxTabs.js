import { rwxCore, rwxComponent } from '../rwxCore';
import rwxDOM from '../helpers/rwxDOMHelpers';
import rwxMist from '../common/rwxMist';

import {rwxAnimationChain} from '../modules/rwxAnimation';

class rwxTabs extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-tabs]', canHaveManualControl:false});
	}

	execute(el)
	{
		return new rwxTab(el);
	}

	goToTab(id, tabNumber)
	{
		if(!this.validateParameter(tabNumber, 'number', 'goToTab'))return;
		const IME = this.getIME(id);
		IME && IME.changeTab(tabNumber);		
	}
}

class rwxTab extends rwxComponent {
	constructor(el)
	{
		super({element: el, enableCustomEvents: true});
		this.tabs = [...el.children].filter((c)=>c.classList.contains('rwx-tabs-tab'));
		if(this.tabs.length == 0){return;}
		this.change = this.change.bind(this);
		this.tabHeaders = [];
		let initTab = this.tabs.findIndex((t)=>t.hasAttribute('data-rwx-tabs-initial'));
		this.activeTab = initTab === -1 ? 1 : initTab+1;

		this.declareEvent('tabShow');
		this.declareEvent('tabHide');

		this.autoActiveTabFromLocationHash();
		this.createTabs();
		this.createAnimations();
	}

	createAnimations()
	{
		this.animation = new rwxAnimationChain({
			sequence: [
				{
					from: [1, 1],
					to: [0, 0.5],
					easing:['easeInCubic', 'linear'],
					duration: 300,
					complete: ()=>this.tabHidden()
				},
				{
					to: [1, 1],
					easing: ['easeOutCubic', 'linear'],
					duration:300,
					complete: ()=>this.tabShown()
				}
			],
			complete: ()=>{
				this.stopAnimation =true;
				this.animating=false;
			}
		})
	}

	autoActiveTabFromLocationHash()
	{
		if(window.location.hash)
		{

			const validSelector = selector => {
			  try { document.createDocumentFragment().querySelector(selector) } catch(e) { return false }
			  return true
			}
			const selector = `#${window.location.hash.replace('#', '')}`;
			
			if(!validSelector(selector))return;

			let el = this.el.querySelector(selector);
			
			if(el)
			{
				let tab = rwxDOM.hasAncestor(el, '.rwx-tabs-tab');
				let parent = tab ? rwxDOM.hasAncestor(tab, '.rwx-tabs-tab') : false;
				if(parent && this.el.contains(parent)){this.compareAndOpen(parent); return;}
				if(tab){this.compareAndOpen(tab); this.hash = el;}
			}
		}
	}

	compareAndOpen(compare)
	{
		this.tabs.map((t,i)=>{
			if(t == compare)
			{
				this.activeTab = (i+1);
			}
		})		
	}

	cleanUp()
	{
		this.el.removeChild(this.container);
		this.tabs.map((t)=>{
			t.classList.remove('initial-hide');
			t.style.transform = "";
			t.style.opacity = "";
			t.style.display = "";
			return false;
		});
	}

	createTabs()
	{
		this.container = document.createElement('div');
		this.container.classList.add('rwx-tabs-container');
		this.bullet = document.createElement('span');
		this.bullet.classList.add('bullet');
		this.addElement(this.container, this.bullet);
		let buttonContainer = document.createElement('div');
		buttonContainer.classList.add('rwx-tabs-button-container');
		this.tabs.map((t, i)=>{
			if(t.hasAttribute('data-rwx-tabs-title'))
			{
				let button = document.createElement('button');
				let text = document.createTextNode(t.getAttribute('data-rwx-tabs-title'));
				button.appendChild(text);
				button.classList.add('no-decoration');
				button.setAttribute('role', 'tab');
				button.setAttribute('aria-selected', 'false');
				button.addEventListener('click', ()=>{ this.changeTab(i+1); });
				button.addEventListener('keydown', (e)=>{
					if(e.keyCode == 39) {
						this.tabHeaders[i+1 == this.tabs.length ? 0 : i+1].focus();
					}
					else if (e.keyCode == 37) {
						this.tabHeaders[i == 0 ? this.tabs.length-1 : i-1].focus();
					}
				});
				this.tabHeaders.push(button);
				buttonContainer.appendChild(button);
			}
			if(i+1 == this.activeTab){
				this.tabHeaders[i].setAttribute('aria-selected', true); 
				this.tabHeaders[i].classList.add('active'); 
				window.requestAnimationFrame(()=>{this.moveBullet(this.activeTab)});
			}
			else{t.classList.add('initial-hide')}
			return;
		});
		this.container.appendChild(buttonContainer);
		this.el.insertBefore(this.container, this.tabs[0]);
		new rwxMist(this.container);
		if(this.hash)
		{
			window.requestAnimationFrame(()=>{window.scrollTo(0, window.scrollY + this.hash.getBoundingClientRect().top-40);});
		}
	}

	resetAnimationFlags()
	{
		this.stopAnimation = false;
		this.animation.reset();
	}

	changeTab(tabNumber)
	{
		if(tabNumber == this.activeTab || this.animating || tabNumber < 0 || tabNumber > this.tabs.length){return;}
		this.newTabNumber = tabNumber;
		this.resetAnimationFlags();
		this.moveBullet(tabNumber);
		this.animating = true;
		this.change();
		this.tabHeaders.map((th,i)=>(tabNumber-1 == i) ? th.classList.add('active') : th.classList.remove('active'))
	}

	moveBullet(tabNumber)
	{
		let rect = this.tabHeaders[tabNumber-1].getBoundingClientRect();
		let left = (rect.left - this.el.getBoundingClientRect().left) + this.container.scrollLeft;
		this.bullet.style.left = `${left}px`;
		this.bullet.style.width = `${rect.width}px`;
	}

	change()
	{
		this.animation.animate([
			(s, o)=>{
				this.tabs[this.activeTab-1].style.transform = `scale(${s})`;
				this.tabs[this.activeTab-1].style.opacity = o;				
			},
			(s, o)=>{
				this.tabs[this.activeTab-1].style.transform = `scale(${s})`;
				this.tabs[this.activeTab-1].style.opacity = o;
			}
		]);
		if(this.stopAnimation){return;}
		window.requestAnimationFrame(this.change);
	}

	tabShown()
	{
		this.animating = false;
		this.tabHeaders[this.activeTab-1].setAttribute('aria-selected', 'true');
		this.executeEvent('tabShow', this.activeTab);
	}

	tabHidden()
	{
		let cache = this.activeTab;
		this.tabHeaders[this.activeTab-1].setAttribute('aria-selected', 'false');
		this.tabs[this.activeTab-1].style.display = "none";
		this.activeTab = this.newTabNumber;
		this.tabs[this.activeTab-1].classList.remove('initial-hide');
		this.tabs[this.activeTab-1].style.display = "none";
		this.tabs[this.activeTab-1].removeAttribute('style');
		this.executeEvent('tabHide', cache);
	}
}

export default new rwxTabs();