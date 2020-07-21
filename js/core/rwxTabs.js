import { rwxCore, rwxComponent } from '../rwxCore';
import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxDOM from '../helpers/rwxDOMHelpers';
import rwxMist from '../common/rwxMist';

class rwxTabs extends rwxCore {
	constructor()
	{
		super('[rwx-tabs]');
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
		super({enableCustomEvents: true});
		this.tabs = [...el.children].filter((c)=>c.classList.contains('rwx-tabs-tab'));
		if(this.tabs.length == 0){return;}
		this.el = el;
		this.showTab = this.showTab.bind(this);
		this.hideTab = this.hideTab.bind(this);
		this.tabHeaders = [];
		this.activeTab = 1;

		this.declareEvent('tabShow');
		this.declareEvent('tabHide');

		this.autoActiveTabFromLocationHash();
		this.createTabs();
	}

	autoActiveTabFromLocationHash()
	{
		if(window.location.hash)
		{
			let el = this.el.querySelector(`#${window.location.hash.replace('#', '')}`);
			if(el)
			{
				let tab = rwxDOM.hasAncestor(el, '.rwx-tabs-tab');
				let parent = rwxDOM.hasAncestor(tab, '.rwx-tabs-tab');
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

	createTabs()
	{
		this.container = document.createElement('div');
		this.container.classList.add('rwx-tabs-container');
		this.bullet = document.createElement('span');
		this.bullet.classList.add('bullet');
		this.container.appendChild(this.bullet);
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
				this.container.appendChild(button);
			}
			if(i+1 == this.activeTab){
				this.tabHeaders[i].setAttribute('aria-selected', true); 
				this.tabHeaders[i].classList.add('active'); 
				window.requestAnimationFrame(()=>{this.moveBullet(this.activeTab)});
			}
			else{t.classList.add('initial-hide')}
			return;
		});
		this.el.insertBefore(this.container, this.tabs[0]);
		new rwxMist(this.container);
		if(this.hash)
		{
			window.requestAnimationFrame(()=>{window.scrollTo(0, window.scrollY + this.hash.getBoundingClientRect().top-40);});
		}
	}

	resetAnimationFlags()
	{
		this.shownScale = false;
		this.shownOpacity = false;
		this.hiddenScale = false;
		this.hiddenOpacity = false;
	}

	changeTab(tabNumber)
	{
		if(tabNumber == this.activeTab || this.animating){return;}
		this.newTabNumber = tabNumber;
		this.resetAnimationFlags();
		this.moveBullet(tabNumber);
		this.animating = true;
		this.hideTab();
		this.tabHeaders.map((th,i)=>(tabNumber-1 == i) ? th.classList.add('active') : th.classList.remove('active'))
	}

	moveBullet(tabNumber)
	{
		let rect = this.tabHeaders[tabNumber-1].getBoundingClientRect();
		let left = (rect.left - this.el.getBoundingClientRect().left) + this.container.scrollLeft;
		this.bullet.style.left = `${left}px`;
		this.bullet.style.width = `${rect.width}px`;
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
		this.showTab();
		this.executeEvent('tabHide', cache);
	}

	showTab()
	{
		let scale, opacity;
		if(!this.shownScale){scale = rwxAnimate.fromTo(0.5, 1, 'scaleTab', 'easeOutCubic', 300, ()=>{this.shownScale = true});}
		if(!this.shownOpacity){opacity = rwxAnimate.fromTo(0, 1, 'normalTab', 'linear', 300, ()=>{this.shownOpacity = true;});}
		this.tabs[this.activeTab-1].style.transform = `scale(${scale})`;
		this.tabs[this.activeTab-1].style.opacity = opacity;
		if(this.shownScale && this.shownOpacity){		
			this.tabShown();
			return;
		}
		window.requestAnimationFrame(this.showTab)
	}

	hideTab()
	{
		let scale, opacity;
		if(!this.hiddenScale){scale = rwxAnimate.fromTo(1, 0, 'opaqueTab', 'linear', 300, ()=>{ this.hiddenScale = true; });}
		if(!this.hiddenOpacity){opacity = rwxAnimate.fromTo(1, 0.5, 'deScaleTab', 'easeInCubic', 300, ()=>{ this.hiddenOpacity = true; });}
		this.tabs[this.activeTab-1].style.transform = `scale(${scale})`;
		this.tabs[this.activeTab-1].style.opacity = opacity;
		if(this.hiddenScale && this.hiddenOpacity) {
			this.tabHidden();
			return;
		}
		window.requestAnimationFrame(this.hideTab)
	}

}

export default new rwxTabs();