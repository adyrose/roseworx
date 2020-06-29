import Roseworx from '../rwxCore';

class rwxSliders extends Roseworx.Core {
	constructor()
	{
		super();
	}

	execute()
	{
		const sliders = [...document.querySelectorAll('[rwx-slider]')];
		sliders.map((s)=>{
			const counters = s.hasAttribute('data-rwx-slider-counters');
			const autoSlide = s.hasAttribute('data-rwx-slider-auto-slide');
			const autoSlideTimeout = autoSlide ? s.getAttribute('data-rwx-slider-auto-slide') : 0;
			const reeling = s.hasAttribute('data-rwx-slider-reeling');
			const vertical = s.hasAttribute('data-rwx-slider-vertical');
			const Slider = new rwxSlider(s, vertical, autoSlide, counters, reeling, autoSlideTimeout ? autoSlideTimeout : 5);
			this.addIME(s.id,Slider);
		 	return;
		});
	}

	goToSlide(id, slideNumber)
	{
		const IME = this.getIME(id);
		IME && IME.goToSlide(slideNumber);		
	}

}

class rwxSlider {
	constructor(el, vertical, autoSlide, counters, reeling, autoSlideTimeout)
	{
		this.slides = [...el.children].filter((c)=>c.classList.contains('rwx-slider-slide'));
		if(this.slides.length == 0)return;
		this.reeling = reeling;
		this.currentSlide = 1;
		this.counter = 0;
		this.direction = vertical ? "Y" : "X";
		this.autoSlideLoop = this.autoSlideLoop.bind(this);
		this.autoSlideTimeout = autoSlideTimeout * 60;
		autoSlide && this.autoSlideLoop();
		counters && this.createCounter(el);
		vertical && this.setToHighest(el);
	}

	setToHighest(el)
	{
		el.style.height = Math.max(...this.slides.map((s)=>s.getBoundingClientRect().height)) + "px";
	}

	createCounter(el)
	{
		this.counters = [];
		let dotDiv = document.createElement('div');
		dotDiv.classList.add('rwx-slider-counters');
		for(let d=0;d<this.slides.length;d++)
		{
			let dot = document.createElement('span');
			dot.classList.add('rwx-slider-counters-counter');
			(this.currentSlide == d+1) && dot.classList.add('active');
			dot.addEventListener('click', ()=>{if(d+1 == this.currentSlide)return; this.goToSlide(d+1); this.counter=0;});
			dotDiv.appendChild(dot);
			this.counters.push(dot);
		}
		el.appendChild(dotDiv);
	}

	autoSlideLoop()
	{
		if(this.counter === this.autoSlideTimeout)
		{
			this.goToSlide(this.currentSlide+1);
			this.counter = 0;
		}
		else
		{
			this.counter+=1;
		}
		window.requestAnimationFrame(this.autoSlideLoop);
	}

	isSlideNumberInRange(number)
	{
		return (number > this.slides.length || number < 0) ? 1 : number;
	}

	goToSlide(number)
	{
		let num = this.isSlideNumberInRange(number);
		if(this.reeling)
		{
			this.slides.map((s)=>window.requestAnimationFrame(()=>{s.style.transform = `translate${this.direction}(-${(num-1)*100}%)`}));
		}
		else
		{
			this.slides.map((s,i)=>{
				let slideNumber = i+1;
				let percent = num > this.currentSlide ? "-100" : "0";
				s.removeAttribute('style');
				if(slideNumber != this.currentSlide && slideNumber != num)
				{
					s.style.display = "none";
				}
				else
				{
					s.style.transition = "none";
					if(num < this.currentSlide && (slideNumber == num || this.currentSlide == slideNumber))
					{
						s.style.transform = `translate${this.direction}(-100%)`;

					}
					window.requestAnimationFrame(()=>{
						s.removeAttribute("style");
						s.style.transform = `translate${this.direction}(${percent}%)`;
					});
				}
				return;
			});
		}
		this.counters && this.counters.map((d,i)=>(i==(num-1) ? d.classList.add('active') : d.classList.remove('active')));
		this.currentSlide = num;
	}
}

export default new rwxSliders();