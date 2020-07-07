require('../../scss/modules/rwx-skrollx.scss');
import { rwxCore } from '../rwxCore';

class rwxSkrollX extends rwxCore {
	constructor()
	{
		super();
		this.setTrigger(150);
		this.calculateScroll = this.calculateScroll.bind(this);
		this.doneFlag = 'rwxsx-end';
	}

	setTrigger(val)
	{
		this.trigger = window.innerHeight - val;
	}

	setConfig(obj)
	{
		if(obj.trigger)this.setTrigger(obj.trigger);
	}

	execute()
	{
		this.elements = [...document.querySelectorAll('[rwxsx]')];
		setTimeout(()=>{
			this.calculateScroll();
		}, 500);
		window.addEventListener('scroll', this.calculateScroll);
	}

	calculateScroll()
	{
		this.elements.map((el)=>{
			if(el.classList.contains(this.doneFlag)){return;}
			let t = el.getBoundingClientRect().top;
			if(t<this.trigger)
			{
				if(el.hasAttribute('data-rwxsx-delay'))
				{
					setTimeout(()=>{el.classList.add(this.doneFlag);}, el.getAttribute('data-rwxsx-delay')*1000);
				}
				else
				{
					el.classList.add(this.doneFlag);
				}
			}
		})
	}
}

export default new rwxSkrollX();