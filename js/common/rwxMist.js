require('../../scss/modules/rwx-mist.scss');

import { rwxComponent } from '../rwxCore';

class rwxMist extends rwxComponent {
	constructor(el)
	{
		super({enableResizeDebounce: true})
		this.el = el;
		this.calculate();
		el.addEventListener('scroll', this.update);
	}

	resize()
	{
		this.calculate();
	}

	calculate()
	{
		if(this.el.scrollWidth > this.el.offsetWidth){
			if(!this.rightMist)
			{
				this.rightMist = document.createElement('div');
				this.rightMist.classList.add('rwx-mist-right');
				this.el.appendChild(this.rightMist);
			}
		} 
		else {
			if(this.rightMist)
			{
				this.el.removeChild(this.rightMist); 
				this.rightMist = false;
			}
		}

		if(this.el.scrollHeight > this.el.offsetHeight){
			if(!this.bottomMist)
			{
				this.bottomMist = document.createElement('div');
				this.bottomMist.classList.add('rwx-mist-bottom');
				this.el.appendChild(this.bottomMist);
			}
		} 
		else {
			if(this.bottomMist)
			{
				this.el.removeChild(this.bottomMist); 
				this.bottomMist = false;
			}
		}
		this.update = this.update.bind(this);
	}

	update()
	{
		if(this.rightMist)
		{
			if((this.el.scrollLeft + this.el.offsetWidth) < this.el.scrollWidth){
				this.rightMist.style.display = "block"; 
				this.rightMist.style.right = -this.el.scrollLeft + "px";
				this.rightMist.style.height = this.el.scrollHeight + "px";
			}
			else{this.rightMist.style.display = "none";}
		}
		if(this.bottomMist)
		{
			if((this.el.scrollTop + this.el.offsetHeight) < this.el.scrollHeight){
				this.bottomMist.style.display = "block";
				this.bottomMist.style.width = this.el.scrollWidth + "px";
				this.bottomMist.style.bottom = -this.el.scrollTop + "px";
			}
			else{this.bottomMist.style.display = "none";}
		}
	}
}

export default rwxMist;