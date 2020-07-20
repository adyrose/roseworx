import { rwxCore, rwxComponent } from '../rwxCore';

class rwxSliders extends rwxCore {
	constructor()
	{
		super('[rwx-slider]');
	}

	execute(el)
	{
		const counters = el.hasAttribute('data-rwx-slider-counters');
		const autoSlide = el.hasAttribute('data-rwx-slider-auto-slide');
		const autoSlideTimeout = autoSlide ? el.getAttribute('data-rwx-slider-auto-slide') : false;
		const reeling = el.hasAttribute('data-rwx-slider-reeling');
		const vertical = el.hasAttribute('data-rwx-slider-vertical');
	 	return new rwxSlider(el, vertical, autoSlide, counters, reeling, autoSlideTimeout ? autoSlideTimeout : 5);
	}

	goToSlide(id, slideNumber)
	{
		const IME = this.getIME(id);
		IME && IME.goToSlide(slideNumber);		
	}

}

class rwxSlider extends rwxComponent {
	constructor(el, vertical, autoSlide, counters, reeling, autoSlideTimeout)
	{
		super({enableCustomEvents: true});
		this.slides = [...el.children].filter((c)=>c.classList.contains('rwx-slider-slide'));
		if(this.slides.length == 0)return;
		this.reeling = reeling;
		this.currentSlide = 1;
		this.counter = 0;
		this.direction = vertical ? "Y" : "X";
		this.autoSlideLoop = this.autoSlideLoop.bind(this);
		this.autoSlideTimeout = autoSlideTimeout * 60;

		this.declareEvent('slideShow');
		this.declareEvent('slideHide');

		autoSlide && this.autoSlideLoop();
		counters && this.createCounter(el);
		vertical && this.setToHighest(el);
	}

	setToHighest(el)
	{
		let height = Math.max(...this.slides.map((s)=>s.getBoundingClientRect().height));
		if(this.dotDiv)
		{
			const height2 = this.dotDiv.getBoundingClientRect().height;
			if(height2 > height) { height = height2;}
			this.slides.map((s)=>s.style.height = height + "px")
		}
		el.style.height = height+ "px";
	}

	createCounter(el)
	{
		this.counters = [];
		this.dotDiv = document.createElement('div');
		this.dotDiv.classList.add('rwx-slider-counters');
		this.slides.map((s,i) => {
			let dot = document.createElement('button');
			dot.classList.add('rwx-slider-counters-counter');
			dot.classList.add('no-decoration');
			(this.currentSlide == i+1) && dot.classList.add('active');
			dot.addEventListener('click', ()=>{if(i+1 == this.currentSlide)return; this.goToSlide(i+1); this.counter=0;});
			dot.addEventListener('keyup', (e)=>{
				let next = this.direction == "Y" ? 40 : 39;
				let prev = this.direction == "Y" ? 38 : 37;
				if(e.keyCode == next) {
					e.preventDefault();
					this.counters[i+1 == this.slides.length ? 0 : i+1].focus();
				}
				else if (e.keyCode == prev) {
					e.preventDefault();
					this.counters[i == 0 ? this.slides.length-1 : i-1].focus();
				}
			});
			this.dotDiv.appendChild(dot);
			this.counters.push(dot);
			return;
		});
		el.appendChild(this.dotDiv);
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

	slideComplete(slidOut, slidIn)
	{
		//the CSS transition takes 0.7 seconds , no way to know when complete unless using timeout
		setTimeout(()=>{
			this.executeEvent('slideShow', slidIn);
			this.executeEvent('slideHide', slidOut);
		}, 700);
	}

	goToSlide(number)
	{
		let num = this.isSlideNumberInRange(number);
		if(this.reeling)
		{
			this.slides.map((s)=>window.requestAnimationFrame(()=>{
				s.style.transform = `translate${this.direction}(-${(num-1)*100}%)`;
			}));
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

					setTimeout(()=>{
						s.removeAttribute("style");
						s.style.transform = `translate${this.direction}(${percent}%)`;
					}, 33);
				}
				return;
			});
		}
		this.counters && this.counters.map((d,i)=>(i==(num-1) ? d.classList.add('active') : d.classList.remove('active')));
		this.slideComplete(this.currentSlide, num);
		this.currentSlide = num;
	}
}

export default new rwxSliders();