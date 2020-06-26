require('../../scss/modules/rwx-mist.scss');


//window resize with debounce and mist checking
class rwxMist
{
	constructor(el)
	{
		this.element = el;
		this.calculate();
		el.addEventListener('scroll', this.update);

		window.addEventListener('resize', ()=>{
			this.debounce && clearTimeout(this.debounce)
			this.debounce = setTimeout(()=>{
				this.calculate();
			}, 250)
		})
	}

	calculate()
	{
		if(this.element.scrollWidth > this.element.offsetWidth){
			if(!this.rightMist)
			{
				this.rightMist = document.createElement('div');
				this.rightMist.classList.add('rwx-mist-right');
				this.element.appendChild(this.rightMist);
			}
		} 
		else {
			if(this.rightMist)
			{
				this.element.removeChild(this.rightMist); 
				this.rightMist = false;
			}
		}

		if(this.element.scrollHeight > this.element.offsetHeight){
			if(!this.bottomMist)
			{
				this.bottomMist = document.createElement('div');
				this.bottomMist.classList.add('rwx-mist-bottom');
				this.element.appendChild(this.bottomMist);
			}
		} 
		else {
			if(this.bottomMist)
			{
				this.element.removeChild(this.bottomMist); 
				this.bottomMist = false;
			}
		}
		this.update = this.update.bind(this);
	}

	update()
	{
		if(this.rightMist)
		{
			if((this.element.scrollLeft + this.element.offsetWidth) < this.element.scrollWidth){
				this.rightMist.style.display = "block"; 
				this.rightMist.style.right = -this.element.scrollLeft + "px";
				this.rightMist.style.height = this.element.scrollHeight + "px";
			}
			else{this.rightMist.style.display = "none";}
		}
		if(this.bottomMist)
		{
			if((this.element.scrollTop + this.element.offsetHeight) < this.element.scrollHeight){
				this.bottomMist.style.display = "block";
				this.bottomMist.style.width = this.element.scrollWidth + "px";
				this.bottomMist.style.bottom = -this.element.scrollTop + "px";
			}
			else{this.bottomMist.style.display = "none";}
		}
	}
}

export default rwxMist;