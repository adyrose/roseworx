require('../../scss/components/rwx-tabs.scss');
import Roseworx from '../rwxCore';
import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxMist from '../modules/rwxMist';

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
			if(t.id){this.addIME(t.id,Tab);}
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
		this.hidden = true;
		this.shown = true;
		this.showTab = this.showTab.bind(this);
		this.hideTab = this.hideTab.bind(this);
		this.tabs = [...el.children].filter((c)=>c.classList.contains('rwx-tabs-tab'));
		this.tabHeaders = [];
		this.activeTab = 1;
		if(this.tabs.length == 0){return;}
		this.createTabs(el);
	}

	createTabs(el)
	{
		this.tab = el;
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
			if(i+1 !== this.activeTab){t.style.display = "none";}
			else{this.tabHeaders[i].classList.add('active'); window.requestAnimationFrame(()=>{this.moveBullet(this.activeTab)})}
			return;
		});
		el.insertBefore(this.container, this.tabs[0]);
		new rwxMist(this.container);
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
		let left = (rect.left - this.tab.getBoundingClientRect().left) + this.container.scrollLeft;
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
		let opacity = rwxAnimate.fromTo(1, 0, 'opaqueTab', 'linear', 300, ()=>{
			this.hidden = true; 
			this.tabs[this.activeTab-1].style.display = "none";
			this.activeTab = this.newTabNumber;
			this.tabs[this.activeTab-1].removeAttribute('style');
			this.showTab();
		});
		this.tabs[this.activeTab-1].style.transform = `scale(${scale})`;
		this.tabs[this.activeTab-1].style.opacity = opacity;
		if(this.hidden){return;}
		window.requestAnimationFrame(this.hideTab)
	}

}

export default new rwxTabs();