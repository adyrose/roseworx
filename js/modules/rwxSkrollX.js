require('../../scss/components/rwx-skrollx.scss');

export default class rwxSkrollX {
	constructor(trigger=150)
	{
		this.elements = [...document.querySelectorAll('[rwxsx]')];
		this.trigger = window.innerHeight - trigger;
		this.calculateScroll = this.calculateScroll.bind(this);
		this.doneFlag = 'rwxsx-end';
		setTimeout(()=>{
			this.calculateScroll();
		}, 500);
		window.addEventListener('scroll', this.calculateScroll)
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