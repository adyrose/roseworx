import { rwxCore } from '../rwxCore';
import rwxMisc from '../helpers/rwxMiscHelpers';

class rwxSlideTicker extends rwxCore {
	constructor()
	{
		super();
  	this.timeoutPerLetter = 200;
  	this.timeout = 2000;
  	this.counter = 0;
  	this.letters = [];
		this.go = this.go.bind(this);
		this.closeEarly = this.closeEarly.bind(this);
	}

	execute()
	{
		this.htmlDefinition();
  	this.createKeyframe();
  	this.el.addEventListener('click', this.closeEarly);
	}

	htmlDefinition()
	{
		this.el = document.createElement('div');
		this.el.id = "rwx-slide-ticker";
		this.el.classList.add('rwx-slide-ticker');
		document.body.appendChild(this.el);
	}

	reset()
	{
		this.el.innerHTML = "";
		this.counter = 0;
		this.letters = [];
	}

	closeEarly()
	{
		rwxMisc.zOpaqueOut(this.el);
	}

	setValue(value)
	{
		this.reset();
		let letterArray = [...value];
		let container, span, text;
		for(let letter of letterArray)
		{
			container = document.createElement('div');
			container.classList.add('rwx-slide-ticker-item')
			span = document.createElement('span');
			text = document.createTextNode(letter);
			span.appendChild(text);
			container.appendChild(span);
			container.style.transform = `translateX(${window.innerWidth}px)`;
			this.el.appendChild(container);
			this.letters.push(container);
		}
		this.go();
	}

	go()
	{
		if(this.letters.length == 0){this.error("No Word Set"); return;}
		if(this.letters.length > 25){this.error("Maxium character length is 25"); return;}
		rwxMisc.zOpaqueIn(this.el);
		let interval = setInterval(()=>{
			if(this.counter == this.letters.length)
			{
				clearInterval(interval);
				setTimeout(()=>{
					rwxMisc.zOpaqueOut(this.el);
				}, this.timeout);
				return;
			}
			this.letters[this.counter].classList.add('go');
			this.letters[this.counter].style.animation = `letterIn ${this.timeout / 1000}s cubic-bezier(.03,.94,1,.05)`;
			this.counter +=1;
		}, this.timeoutPerLetter);
	}

	createKeyframe()
	{
		const style = document.createElement('style');
		style.type = 'text/css';
		const keyframe = `
			@keyframes letterIn {
				0%
				{
					transform: translateX(${window.innerWidth}px);
				}
				100%
				{
					transform:translateX(-${window.innerWidth}px);
				}
			}
		`;
		style.innerHTML = keyframe;
		document.getElementsByTagName('head')[0].appendChild(style);
	}
}

export default new rwxSlideTicker();