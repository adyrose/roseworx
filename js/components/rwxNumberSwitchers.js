require('../../scss/components/rwxNumberSwitcher.scss');

import { rwxCore, rwxComponent } from '../rwxCore';

class rwxNumberSwitchers extends rwxCore {
	constructor()
	{
		super('[rwx-number-switcher]');
	}

	execute(el)
	{
		const initialValue = el.hasAttribute('data-rwx-number-switcher-initial-value') ? el.getAttribute('data-rwx-number-switcher-initial-value') : 0;
		const stopAtZero = el.hasAttribute('data-rwx-number-switcher-stop-at-zero');
		return new rwxNumberSwitcher(el, initialValue, stopAtZero);
	}

	switch(id, value)
	{
		if(!this.validateParameter(value, 'number', 'switch'))return;
		const IME = this.getIME(id);
		IME && IME.switch(value);		
	}
}

class rwxNumberSwitcher extends rwxComponent {
	constructor(el, initialValue, stopAtZero)
	{
		super({enableCustomEvents: true, enableAnimationLoop: true});
		this.el = el;
		if(isNaN(initialValue)){this.error("Initial value needs to be number"); return}
		this.stopAtZero = stopAtZero;
		this.htmlDefinition();
		this.duration = 1;
		initialValue = parseInt(initialValue);
		this.prevValue = initialValue;
		this.format = new Intl.NumberFormat('en-GB', { style: 'decimal'});
		this.updateText(initialValue);
	}

	htmlDefinition()
	{
		this.elValue = document.createElement('span');
		this.elValue.classList.add('value');
		this.el.appendChild(this.elValue);
	}

	updateText(txt)
	{
		this.elValue.innerText = this.formatNumber(txt);
	}

	formatNumber(n)
	{
		let arr = this.format.formatToParts(n)
		let arrf = arr.filter((a)=>a.type != 'decimal' && a.type != 'fraction');
		let string = '';
		arrf.map((a)=>string+=a.value);
		return string;
		//return this.format.format(n);
	}

	animate()
	{
		let currentValue = this.prevValue+this.counter;
		if((this.prevValue < this.newValue && currentValue > this.newValue) || (this.prevValue > this.newValue && currentValue < this.newValue)){
			this.el.classList.remove('pulsate');
			this.updateText(this.newValue);
			this.prevValue = this.newValue;
			this.stopAnimation = true;
		}
		else
		{
			this.updateText(currentValue);
		}
		this.counter += this.prevValue < this.newValue ? this.increment : -this.increment;
	}

	switch(newValue, noAnimate=false)
	{
		newValue = parseInt(newValue);
		if(newValue == this.prevValue){return;}
		this.counter = 0;
		if(this.stopAtZero)
		{
			newValue = newValue < 0 ? 0 : newValue;
		}
		this.newValue = newValue;
		this.increment = (Math.abs(this.prevValue - this.newValue)/60)/this.duration;
		this.el.classList.add('pulsate');
		if(noAnimate){this.updateText(newValue); setTimeout(()=>{this.el.classList.remove('pulsate');}, 1000); return;};
		this.startAnimation();
	}
}

export default new rwxNumberSwitchers();