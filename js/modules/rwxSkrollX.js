require('../../scss/modules/rwx-skrollx.scss');

class rwxSkrollX {
	constructor(trigger=150)
	{
		this.trigger = window.innerHeight - trigger;
		this.calculateScroll = this.calculateScroll.bind(this);
		this.init = this.init.bind(this);
		this.doneFlag = 'rwxsx-end';
		window.addEventListener('load', this.init);
	}

	setConfig(obj)
	{
		//Object.assign(this, obj);
		if(obj.trigger){this.trigger = window.innerHeight - obj.trigger}
	}

	init()
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
					setTimeout(()=>{el.classList.add(this.doneFlag);}, el.getAttribute('data-rwxsx-delay'));
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