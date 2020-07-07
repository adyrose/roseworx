require('../../scss/modules/rwx-skrollx.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

class rwxSkrollX extends rwxCore {
	constructor()
	{
		super('[rwxsx]');
	}

	execute(el)
	{
		const trigger = el.hasAttribute('data-rwxsx-trigger') ? el.getAttribute('data-rwxsx-trigger') : false;
		const delay = el.hasAttribute('data-rwxsx-delay') ? el.getAttribute('data-rwxsx-delay') : false;
		return new rwxSkrollXItem(el, trigger, delay);
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

	scroll()
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
		//when comes to have animations repeated again when scrolled out of view above line will change
	}
}

export default new rwxSkrollX();