import { rwxCore, rwxComponent } from '../rwxCore';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';

class rwxOptionSelectors extends rwxCore {
	constructor()
	{
		super('[rwx-option-selector]', true);
	}

	execute(el, mc)
	{
		return new rwxOptionSelector(el, mc);
	}

	onSelected(id, cb)
	{
		const IME = this.getIME(id);
		IME && IME.onSelected(cb);		
	}

	launch(id)
	{
		const IME = this.getIME(id);
		IME && IME.launch();		
	}
}

class rwxOptionSelector extends rwxComponent {
	constructor(el, manualControl)
	{
		super({element: el, enableScrollIntoView: !manualControl});
		this.items = [];
		this.buttons = [];
		this.activeButton = 1;
		this.clickListener = this.clickListener.bind(this);
		this.buttons = [...this.el.querySelectorAll('.rwx-option-selector-item')];
		this.cachedButtons = this.buttons;
		if(this.buttons.length === 0)
		{
			this.error('No items with class .rwx-option-selector-item detected');
			this.bail = true;
			return;
		}
		if(this.buttons.length > 6)
		{
			this.error('Too many .rwx-option-selector-item options, hiding options above 6.');
			this.buttons.map((b,i)=>i>=6&&this.el.removeChild(b));
			this.buttons = this.buttons.filter((b,i)=>i<6);
		}
		this.assignParentClass();
		this.htmlDefinition();
		this.elFullSizeAbsolute();
	}

	assignParentClass()
	{
		switch(this.buttons.length)
		{
			case 1:
				this.el.classList.add('one');
				this.addedClass = "one";
				break;
			case 2:
				this.el.classList.add('two');
				this.addedClass = "two";
				break;
			case 3:
				this.el.classList.add('three');
				this.addedClass = "three";
				break;
			case 4:
				this.el.classList.add('four');
				this.addedClass = "four";
				break;
			case 5:
				this.el.classList.add('five');
				this.addedClass = "five";
				break;
			case 6:
				this.el.classList.add('six');
				this.addedClass = "six";
				break;
			default:
				break;
		}
	}

	uncommenced()
	{
		this.containers.map((i)=>i.classList.remove('active'));
	}

	launch()
	{
		if(this.bail)return;
		this.restartScroll();
	}

	onSelected(cb)
	{
		this.callback = cb;
	}

	scrolledIntoView()
	{
		if(this.bail)return;
		this.containers.map((i)=>i.classList.add('active'));
		this.stopScroll();
	}

  cleanUp()
  {
  	this.cachedButtons.map((b)=>{
  		b.removeEventListener('keydown', this.clickListener);
  		b.removeEventListener('click', this.clickListener);
  		this.el.appendChild(b);
  		return false;
  	});
  	this.borders.map((bo)=>bo.cleanUp());
  	this.el.classList.remove(this.addedClass);
  }

	htmlDefinition()
	{
		this.containers = [];
		this.borders = [];
		for(let item of this.buttons)
		{
			let container = document.createElement('div');
			container.classList.add('rwx-option-selector-item-container');
			item.setAttribute('tabIndex', 0);
			this.containers.push(container);
			container.appendChild(item);
			this.addElement(this.el, container);
			item.addEventListener('click', this.clickListener);
			item.addEventListener('keydown', this.clickListener);
			this.borders.push(new rwxAnimatedBorder(item));
		}
	}

	clickListener(ev)
	{
		if(ev.type === "keydown")
		{
  		if(ev.keyCode == 37 || ev.keyCode == 39 || ev.keyCode == 9)
  		{
  			this.activeButton = this.activeButton == 0 ? 1 : 0;
  			this.buttons[this.activeButton].focus();
  		}
  		if(ev.keyCode == 32 || ev.keyCode == 13)
  		{
  			ev.preventDefault();
  			this.selected(this.buttons.filter((f)=>f===ev.target)[0]);
  		}
		}
		else
		{
			ev.preventDefault();
			this.selected(this.buttons.filter((f)=>f===ev.target.parentNode.parentNode)[0]);
		}
	}

	selected(val)
	{
		let value = val.getAttribute('data-rwx-option-selector-value') || val.innerText;
		this.containers.map(b=>b.classList.add('remove'));
		this.callback && this.callback(value);
		setTimeout(()=>{
			this.containers.map(b=>b.classList.remove('remove', 'active'));
		}, 1000);
	}
}

export default new rwxOptionSelectors();