import { rwxCore } from '../rwxCore';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';

class rwxDuoSelector extends rwxCore {
	constructor()
	{
		super();
		this.items = [];
		this.buttons = [];
		this.activeButton = 1;
	}

	execute()
	{
		this.htmlDefinition();
	}

  accessible()
  {
  	this.el.setAttribute('tabIndex', 1);
  	this.el.focus();
  	this.keyDown = (ev)=>{
  		ev.preventDefault(); 
  		if(ev.keyCode == 37 || ev.keyCode == 39 || ev.keyCode == 9)
  		{
  			this.buttons[this.activeButton].unactive();
  			this.activeButton = this.activeButton == 0 ? 1 : 0;
  			this.buttons[this.activeButton].active();
  		}
  		if(ev.keyCode == 32 || ev.keyCode == 13)
  		{
  			this.buttons[this.activeButton].target.click();
  		}
  	}
  	this.el.addEventListener('keydown', this.keyDown);
  }

  unaccessible()
  {
  	this.el.removeAttribute('tabIndex');
  	this.el.removeEventListener('keydown', this.keyDown);
  }

	htmlDefinition()
	{
		this.el = document.createElement('div');
		this.el.classList.add('rwx-duo-selector');
		this.el.id = 'rwx-duo-selector';
		document.body.appendChild(this.el);
	}

	selected(val)
	{
		this.callback(val);
		this.opened = false;
		this.unaccessible();
		this.items.map(dpi=>dpi.classList.add('remove'));
		setTimeout(()=>{
			this.el.innerHTML = "";
			this.items = [];
			this.buttons.map((b)=>b.unactive());
			this.buttons = [];
			this.el.classList.remove('active');
		}, 1000);
	}

	validateOptions(options)
	{
		if(!options){this.error('setValues - requires an array of objects.'); return false;}
		if(options.length < 2){this.error('setValues - requires at least 2 objects.'); return false;}
		if(options.length > 2){this.error('setValues - only accepts 2 objects, using first 2.');}
		if(!options[0].value || !options[0].displayName || !options[1].value || !options[1].displayName){this.error('setValues - value and displayName required.'); return false;}
		return true;
	}

	setValues(options)
	{
		if(!this.validateOptions(options) || this.opened) return;
		options = options.slice(0,2);
		let el, btn, btnText;
		let btns = [];
		this.opened = true;
		this.el.classList.add('active');
		this.accessible();
		for(let item of options)
		{
			el = document.createElement('div');
			el.classList.add('rwx-duo-selector-item');
			btn = document.createElement('div');
			btn.classList.add('rwx-duo-selector-item-button');
			btnText = document.createElement('button');
			btnText.classList.add('no-decoration');
			btnText.innerText = item.displayName;
			btnText.classList.add('text');
			btn.addEventListener('click', ()=>{this.selected(item.value)});
			btn.appendChild(btnText);
			el.appendChild(btn);
			btns.push(btn);
			this.items.push(el);
			this.el.appendChild(el);
		}
		btns.map((b)=>{this.buttons.push(new rwxAnimatedBorder(b));});
		return new Promise((resolve, reject)=>{this.callback = resolve;})
	}
}

export default new rwxDuoSelector();