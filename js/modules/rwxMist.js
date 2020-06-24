require('../../scss/modules/rwx-mist.scss');

class rwxTableMist
{
	constructor(el)
	{
		this.element = el;
		if(this.element.scrollWidth > this.element.offsetWidth){
			this.rightMist = document.createElement('div');
			this.rightMist.classList.add('rwx-mist-right');
			this.element.appendChild(this.rightMist);
		}
		if(this.element.scrollHeight > this.element.offsetHeight){
			this.bottomMist = document.createElement('div');
			this.bottomMist.classList.add('rwx-mist-bottom');
			this.element.appendChild(this.bottomMist);
		}
		this.update = this.update.bind(this);
		el.addEventListener('scroll', this.update);
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

export default rwxTableMist;