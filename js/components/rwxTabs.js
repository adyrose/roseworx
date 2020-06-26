require('../../scss/components/rwx-tabs.scss');
import Roseworx from '../rwxCore';
import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxDOM from '../helpers/rwxDOMHelpers';
import rwxMist from '../common/rwxMist';

class rwxTabs extends Roseworx.Core {
	constructor()
	{
		super();
	}

	execute()
	{
		const tabs = [...document.querySelectorAll('[rwx-tabs]')];
		tabs.map((t)=>{
			const Tab = new rwxTab(t);
			this.addIME(t.id,Tab);
		 	return;
		});
	}

	goToTab(id, tabNumber)
	{
		const IME = this.getIME(id);
		IME && IME.changeTab(tabNumber);		
	}
}

class rwxTab {
	constructor(el)
	{
		this.el = el;
		this.hidden = true;
		this.shown = true;
		this.showTab = this.showTab.bind(this);
		this.hideTab = this.hideTab.bind(this);
		this.tabs = [...this.el.children].filter((c)=>c.classList.contains('rwx-tabs-tab'));
		this.tabHeaders = [];
		this.activeTab = 1;
		if(this.tabs.length == 0){return;}
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
				let span = document.createElement('span');
				let text = document.createTextNode(t.getAttribute('data-rwx-tabs-title'));
				span.appendChild(text);
				span.addEventListener('click', ()=>{ this.changeTab(i+1); });
				this.tabHeaders.push(span);
				this.container.appendChild(span);
			}
			if(i+1 == this.activeTab){this.tabHeaders[i].classList.add('active'); window.requestAnimationFrame(()=>{this.moveBullet(this.activeTab)})}
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

	changeTab(tabNumber)
	{
		if(tabNumber == this.activeTab || !this.shown || !this.hidden){return;}
		this.newTabNumber = tabNumber;
		this.shown = false;
		this.hidden = false;
		this.moveBullet(tabNumber);
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

	showTab()
	{
		let scale = rwxAnimate.fromTo(0.5, 1, 'scaleTab', 'easeOutCubic', 300);
		let opacity = rwxAnimate.fromTo(0, 1, 'normalTab', 'linear', 300, ()=>{this.shown = true;})
		this.tabs[this.activeTab-1].style.transform = `scale(${scale})`;
		this.tabs[this.activeTab-1].style.opacity = opacity;
		if(this.shown){return;}
		window.requestAnimationFrame(this.showTab)
	}

	hideTab()
	{
		let scale = rwxAnimate.fromTo(1, 0.5, 'deScaleTab', 'easeInCubic', 300);
		let opacity = rwxAnimate.fromTo(1, 0, 'opaqueTab', 'linear', 300, ()=>{ this.hidden = true;});
		this.tabs[this.activeTab-1].style.transform = `scale(${scale})`;
		this.tabs[this.activeTab-1].style.opacity = opacity;
		if(this.hidden) {
			this.tabs[this.activeTab-1].style.display = "none";
			this.activeTab = this.newTabNumber;
			this.tabs[this.activeTab-1].classList.remove('initial-hide');
			this.tabs[this.activeTab-1].style.display = "none";
			this.tabs[this.activeTab-1].removeAttribute('style');
			this.showTab();
			return;
		}
		window.requestAnimationFrame(this.hideTab)
	}

}

export default new rwxTabs();