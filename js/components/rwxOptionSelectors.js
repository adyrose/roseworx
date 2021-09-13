import { rwxCore, rwxComponent } from '../rwxCore';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';
import rwxDOM from '../helpers/rwxDOMHelpers';

class rwxOptionSelectors extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-option-selector]', canHaveManualControl:true, resource: 'rwxOptionSelectors'});
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

	onSelected(cb)
	{
		this.callback = cb;
	}

	scrolledIntoView()
	{
		if(this.bail)return;
		this.buttons.map((i)=>i.classList.add('active'));
		this.stopScroll();
	}

  cleanUp()
  {
  	this.buttons.map((b)=>{
  		b.removeEventListener('keydown', this.clickListener);
  		b.removeEventListener('click', this.clickListener);
  		b.classList.remove('active');
  		return false;
  	});
  	this.borders.map((bo)=>bo.cleanUp());
  	this.el.classList.remove(this.addedClass);
  }

	htmlDefinition()
	{
		this.borders = [];
		for(let item of this.buttons)
		{
			this.convertToButton(item.children[0]);
			item.addEventListener('click', this.clickListener);
			item.addEventListener('keydown', this.clickListener);
			this.borders.push(new rwxAnimatedBorder(item.children[0]));
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
  		if(this.isKeyboardClick(ev))
  		{
  			ev.preventDefault();
  			this.selected(this.buttons.find((f)=>f===rwxDOM.hasAncestor(ev.target, '.rwx-option-selector-item')));
  		}
		}
		else
		{
			ev.preventDefault();
			this.selected(this.findElement(ev.target));
		}
	}

	findElement(t)
	{
		return this.buttons.find((f)=>f===rwxDOM.hasAncestor(t, '.rwx-option-selector-item') || f===t);
	}

	selected(val)
	{
		let value = val.getAttribute('data-rwx-option-selector-value') || val.children[0].innerText;
		this.buttons.map(b=>b.classList.add('remove'));
		this.callback && this.callback(value);
		setTimeout(()=>{
			this.buttons.map((b,i)=>{
				b.classList.remove('remove', 'active');
				this.addAttribute(b, 'aria-hidden', true);
				b.children[0].setAttribute('tabindex', -1);
				return false;
			});
		}, 1000);
	}
}

export default new rwxOptionSelectors();