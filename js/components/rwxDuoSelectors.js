import { rwxCore, rwxComponent } from '../rwxCore';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';

class rwxDuoSelectors extends rwxCore {
	constructor()
	{
		super('[rwx-duo-selector]', true);
	}

	execute(el, mc)
	{
		return new rwxDuoSelector(el, mc);
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

class rwxDuoSelector extends rwxComponent {
	constructor(el, manualControl)
	{
		super({element: el, enableScrollIntoView: !manualControl});
		this.items = [];
		this.buttons = [];
		this.activeButton = 1;
		this.clickListener = this.clickListener.bind(this);
		this.buttons = [...this.el.querySelectorAll('.rwx-duo-selector-item')];
		this.htmlDefinition();
		this.elFullSizeAbsolute();
	}

	launch()
	{
		this.restartScroll();
	}

	onSelected(cb)
	{
		this.callback = cb;
	}

	scrolledIntoView()
	{
		this.containers.map((i)=>i.classList.add('active'));
		this.stopScroll();
	}

  cleanUp()
  {
  	this.buttons.map((b)=>{
  		b.removeEventListener('keydown', this.clickListener);
  		b.removeEventListener('click', this.clickListener);
  		this.el.appendChild(b);
  		return false;
  	})
  }

	htmlDefinition()
	{
		this.containers = [];
		for(let item of this.buttons)
		{
			let container = document.createElement('div');
			container.classList.add('rwx-duo-selector-item-container');
			item.setAttribute('tabIndex', 0);
			this.containers.push(container);
			container.appendChild(item);
			this.addElement(this.el, container);
			item.addEventListener('click', this.clickListener);
			item.addEventListener('keydown', this.clickListener);
			new rwxAnimatedBorder(item);
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
		let value = val.getAttribute('data-rwx-duo-selector-value') || val.innerText;
		this.containers.map(b=>b.classList.add('remove'));
		setTimeout(()=>{
			this.containers.map(b=>b.classList.remove('remove', 'active'));
			this.callback && this.callback(value);
		}, 1000);
	}
}

export default new rwxDuoSelectors();