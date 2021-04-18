require('../../scss/modules/rwx-skrollx.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

class rwxSkrollX extends rwxCore {
	constructor()
	{
		super('[rwxsx],[rwxpx]');
		this.directionDefault = "up";
		this.parallaxValueDefault = 10;
	}

	execute(el)
	{
		const trigger = el.hasAttribute('data-rwxsx-trigger') ? el.getAttribute('data-rwxsx-trigger') : false;
		const delay = el.hasAttribute('data-rwxsx-delay') ? el.getAttribute('data-rwxsx-delay') : false;
		const parallax = el.hasAttribute('rwxpx');
		const direction = el.hasAttribute('data-rwxpx-direction') ? el.getAttribute('data-rwxpx-direction') : this.directionDefault;
		const value = el.hasAttribute('data-rwxpx-value') ? el.getAttribute('data-rwxpx-value') : this.parallaxValueDefault;
		return parallax ? new rwxParallaxItem(el, direction, value) : new rwxSkrollXItem(el, trigger, delay, parallax);
	}
}

class rwxParallaxItem extends rwxComponent {
	constructor(el, direction, value)
	{
		super({enableScrollTracking: true});
		this.el = el;
		this.parallaxMultiplier = parseInt(value);
		this.direction = direction;
	}

	scrollEvent()
	{
		const bounds = this.el.getBoundingClientRect();
		let inView = ((window.innerHeight-bounds.top)>0 && (bounds.top+bounds.height)>0);
		if(!inView)return;
		let val = ((((window.innerHeight/2)-(bounds.top+bounds.height/2))*(this.direction==="up" ? -1 : 1))/this.parallaxMultiplier);
		this.el.style.transform = `translate3d(0px, ${val}px, 0px)`;
	}
}

class rwxSkrollXItem extends rwxComponent {
	constructor(el, trigger, delay)
	{
		super({enableScrollIntoView: true});
		trigger && this.setScrollTrigger(trigger);
		this.el = el;
		this.delay = delay;
		this.doneFlag = 'rwxsx-end';
	}

	scrolledIntoView()
	{
		if(this.delay)
		{
			setTimeout(()=>{this.el.classList.add(this.doneFlag);}, this.delay*1000);
		}
		else
		{
			this.el.classList.add(this.doneFlag);
		}
		this.stopScroll = true;
	}
}

export default new rwxSkrollX();