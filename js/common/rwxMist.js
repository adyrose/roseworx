import { rwxComponent } from '../rwxCore';

class rwxMist extends rwxComponent {
	constructor(el)
	{
		super({enableResizeDebounce: true})
		this.el = el;
		this.update = this.update.bind(this);
		this.calculate();
		this.addStyle(this.el, 'overflow', 'auto');
		this.addStyle(this.el, 'position', 'relative');
		this.el.addEventListener('scroll', this.update);
	}

	cleanUp()
	{
		this.el.removeEventListener('scroll', this.update);
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
				this.addElement(this.el, this.rightMist);
			}
		} 
		else {
			if(this.rightMist)
			{
				this.removeElement(this.el, this.rightMist);
				this.rightMist = false;
			}
		}
		if(this.el.scrollHeight > this.el.offsetHeight){
			if(!this.bottomMist)
			{
				this.bottomMist = document.createElement('div');
				this.bottomMist.classList.add('rwx-mist-bottom');
				this.addElement(this.el, this.bottomMist);
			}
		} 
		else {
			if(this.bottomMist)
			{
				this.removeElement(this.el, this.bottomMist);
				this.bottomMist = false;
			}
		}
	}

	update()
	{
		if(this.rightMist)
		{
			(this.el.scrollLeft + this.el.offsetWidth) < this.el.scrollWidth ? this.rightMist.classList.remove('hide') : this.rightMist.classList.add('hide');
			this.rightMist.style.right = -this.el.scrollLeft + "px";
			this.rightMist.style.height = this.el.scrollHeight + "px";
		}
		if(this.bottomMist)
		{
			(this.el.scrollTop + this.el.offsetHeight) < this.el.scrollHeight ? this.bottomMist.classList.remove('hide') : this.bottomMist.classList.add('hide');
			this.bottomMist.style.width = this.el.scrollWidth + "px";
			this.bottomMist.style.bottom = -this.el.scrollTop + "px";
		}
	}
}

export default rwxMist;