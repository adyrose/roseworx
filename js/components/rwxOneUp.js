require('../../scss/components/rwxOneUp.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

class rwxOneUps extends rwxCore {
	constructor()
	{
		super('[rwx-one-up]', true);
	}

	execute(el, mc)
	{
		return new rwxOneUp(el, mc);
	}

	uncommence(id)
	{
		const IME = this.getIME(id);
		IME && IME.down();		
	}
}

class rwxOneUp extends rwxComponent {
	constructor(el, manualControl)
	{
		super({enableScrollIntoView: !manualControl})
		this.el = el;
		this.htmlDefinition();
		this.clear = this.clear.bind(this);
	}

	scrolledIntoView()
	{
		this.up();
		this.stopScroll = true;
	}

	htmlDefinition()
	{
		let scale, rotate, color, container;
		let cache = this.el.parentNode;
  	scale = document.createElement('div');
  	scale.classList.add('rwx-one-up-scale');
  	rotate = document.createElement('div');
  	rotate.classList.add('rwx-one-up-rotate');
  	rotate.appendChild(this.el);
  	this.el.classList.add('rwx-one-up-color');
  	this.el.classList.add('rwx-one-up-image');
  	scale.appendChild(rotate);
  	this.scale = scale;
  	this.rotate = rotate;
  	this.color = color;
  	container = document.createElement('div');
  	container.classList.add('rwx-one-up-container');
  	container.appendChild(this.scale);
  	cache.appendChild(container);
	}

	getNode()
	{
		return this.el;
	}

	up()
	{
		this.scale.classList.add('go');
		this.el.classList.add('go');
		this.rotate.classList.add('go');
	}

	down()
	{
		this.scale.classList.add('ungo');
		this.el.classList.add('ungo');
		this.rotate.classList.add('ungo');
		setTimeout(this.clear, 1000);
	}

	clear()
	{
		this.scale.classList.remove('go');
		this.el.classList.remove('go');
		this.rotate.classList.remove('go');
		this.scale.classList.remove('ungo');
		this.el.classList.remove('ungo');
		this.rotate.classList.remove('ungo');
	}

}

export default new rwxOneUps();