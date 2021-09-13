import { rwxCore, rwxComponent } from '../rwxCore';

class rwxSliders extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-slider]', canHaveManualControl:false, resource: 'rwxSliders'});
		this.defaultAutoSlideTimeout = 5;
		this.defaultCounters = true;
	}

	execute(el)
	{
		const counters = this.checkAttributeOrDefault(el, 'data-rwx-slider-counters', this.defaultCounters) === "true";
		const autoSlide = this.checkAttributeForBool(el, 'data-rwx-slider-auto-slide');
		const autoSlideTimeout = this.checkAttributeOrDefault(el, 'data-rwx-slider-auto-slide-timeout', this.defaultAutoSlideTimeout);
		const reeling = this.checkAttributeForBool(el, 'data-rwx-slider-reeling');
		const vertical = this.checkAttributeForBool(el, 'data-rwx-slider-vertical');
	 	return new rwxSlider(el, vertical, autoSlide, counters, reeling, autoSlideTimeout);
	}

	goToSlide(id, slideNumber)
	{
		if(!this.validateParameter(slideNumber, 'number', 'goToSlide'))return;
		const IME = this.getIME(id);
		IME && IME.goToSlide(slideNumber);		
	}

}

class rwxSlider extends rwxComponent {
	constructor(el, vertical, autoSlide, counters, reeling, autoSlideTimeout)
	{
		super({enableCustomEvents: true, element:el});
		this.slides = [...el.children].filter((c)=>c.classList.contains('rwx-slider-slide'));
		if(this.slides.length == 0)return;
		this.reeling = reeling;
		this.currentSlide = 1;
		this.autoSlide = autoSlide;
		this.counter = 0;
		this.direction = vertical ? "Y" : "X";
		this.autoSlideLoop = this.autoSlideLoop.bind(this);
		this.autoSlideTimeout = autoSlideTimeout * 60;

		this.declareEvent('slideShow');
		this.declareEvent('slideHide');

		autoSlide && this.autoSlideLoop();
		counters && this.createCounter();
		vertical && this.setToHighest();
	}

	setToHighest()
	{
		let height = Math.max(...this.slides.map((s)=>s.getBoundingClientRect().height));
		if(this.dotDiv)
		{
			const height2 = this.dotDiv.getBoundingClientRect().height;
			if(height2 > height) { height = height2;}
			this.slides.map((s)=>s.style.height = height + "px")
		}
		this.el.style.height = height+ "px";
	}

	cleanUp()
	{
		this.slides.map((s, i)=>{
			s.style.transform = '';
			s.style.display = '';
		})
	}

	createCounter()
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
		this.addElement(this.el, this.dotDiv);
	}

	autoSlideLoop()
	{
		if(this.stopAnimation){return;}
		if(this.counter >= this.autoSlideTimeout)
		{
			this.goToSlide(this.currentSlide+1, true);
			this.counter = 0;
		}
		else
		{
			this.counter+=1;
		}
		window.requestAnimationFrame(this.autoSlideLoop);
	}

	isSlideNumberInRange(number, dontAllowOutOfBounds)
	{
		return (number > this.slides.length || number < 0) ? dontAllowOutOfBounds ? 1 : false : number;
	}

	slideComplete(slidOut, slidIn)
	{
		//the CSS transition takes 0.7 seconds , no way to know when complete unless using timeout
		setTimeout(()=>{
			this.executeEvent('slideShow', slidIn);
			this.executeEvent('slideHide', slidOut);
		}, 700);
	}

	goToSlide(number, fromAutoLoop=false)
	{

		let num = this.isSlideNumberInRange(number, fromAutoLoop);
		if(!num)return;
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