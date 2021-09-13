import { rwxCore, rwxComponent } from '../rwxCore';
import rwxFade from '../effects/rwxFade';

class rwxSlideTickers extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-slide-ticker]', canHaveManualControl: false, resource: 'rwxSlideTickers'});
	}

	execute(el)
	{
		return new rwxSlideTicker(el);
	}

  tick(id)
  {
    const IME = this.getIME(id);
    IME && IME.tick();
  }
}

class rwxSlideTicker extends rwxComponent {
	constructor(el)
	{
		super({element: el});
  	this.timeoutPerLetter = 200;
  	this.timeout = 2000;
  	this.word = this.el.querySelector('.rwx-slide-ticker-value');
		this.closeEarly = this.closeEarly.bind(this);
		this.createKeyframe();
	}

	cleanUp()
	{
		rwxFade.cleanUp(this.el);
	}

	reset()
	{
		this.counter = 0;
		this.letters = [];
	}

	closeEarly()
	{
		rwxFade.fadeOut(this.el);
	}

	tick()
	{
		this.el.addEventListener('click', this.closeEarly);
		this.reset();
		this.addStyle(this.word, 'display', 'none');
		let letterArray = [...this.word.innerText];
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
			this.addElement(this.el, container);
			this.letters.push(container);
		}
		this.go();
	}

	go()
	{
		if(this.letters.length == 0){this.error("No Word Set"); return;}
		if(this.letters.length > 25){this.error("Maxium character length is 25"); return;}
		rwxFade.fadeIn(this.el);
		let interval = setInterval(()=>{
			if(this.counter == this.letters.length)
			{
				clearInterval(interval);
				setTimeout(()=>{
					rwxFade.fadeOut(this.el);
					this.el.removeEventListener('click', this.closeEarly);
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
		// document.getElementsByTagName('head')[0].appendChild(style);
		this.addElement(document.getElementsByTagName('head')[0], style)
	}
}

export default new rwxSlideTickers();