import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxMath from '../helpers/rwxMathHelpers';

import { rwxCore } from '../rwxCore';
import rwxAnimateableBorder from '../common/rwxAnimateableBorder';

class rwxTombola extends rwxCore {
  constructor()
  {
  	super();
    this.counter = 0;
    this.speed = 12;
    this.autoStop = true;
    this.timeBeforeAutoStop = 10;
    this.spin = this.spin.bind(this);
    this.stopSpin = this.stopSpin.bind(this);
  }

  execute()
  {
  	this.htmlDefinition();
  	this.stopNode.addEventListener('click', this.stopSpin);
  }

  accessible()
  {
  	this.el.setAttribute('tabIndex', 1);
  	this.el.focus();
  	this.keyDown = (ev)=>{ev.preventDefault(); (ev.keyCode == 32 || ev.keyCode == 13) && this.stopSpin();}
  	this.el.addEventListener('keydown', this.keyDown);
  }

  unaccessible()
  {
  	this.el.removeAttribute('tabIndex');
  	this.el.removeEventListener('keydown', this.keyDown);
  }

  setConfig(c)
  {
  	if(!c){this.error('setConfig - requires an object'); return;}
  	if(c.stopText !== undefined){this.stopText.innerText = c.stopText; this.button.recalculate();}
  	if(c.autoStop !== undefined){this.autoStop = Boolean(c.autoStop);}
  	if(c.timeBeforeAutoStop !== undefined && !isNaN(c.timeBeforeAutoStop)){this.timeBeforeAutoStop = c.timeBeforeAutoStop;}
  }

  htmlDefinition()
  {
  	this.tombola = document.createElement('div');
  	this.tombola.classList.add('rwx-tombola');
  	this.tombola.id = "rwx-tombola";
    this.el = document.createElement('div');
    this.el.classList.add('rwx-tombola-background');
    this.tombolaContainer = document.createElement('div');
    this.tombolaContainer.classList.add('rwx-tombola-container');
    this.stopNode = document.createElement('div');
    this.stopNode.classList.add('rwx-tombola-stopper');
    this.stopText = document.createElement('button');
    this.stopText.classList.add('no-decoration');
    this.stopText.classList.add('text');
    this.stopText.innerText = "Stop";
    this.stopNode.appendChild(this.stopText);
    this.tombolaContainer.appendChild(this.tombola);
    this.el.appendChild(this.tombolaContainer);
    this.el.appendChild(this.stopNode);
    document.body.appendChild(this.el);
    this.button = new rwxAnimateableBorder(this.stopNode);
  }

  setOptions(arr)
  {
    this.tombola.innerHTML = "";
    let option, optionTitle;
    this.items = [];
    for(let v of arr)
    {
      option = document.createElement('div');
      option.classList.add('rwx-tombola-item');
      option.setAttribute('data-value', v.value);
      optionTitle = document.createElement('span');
      optionTitle.appendChild(document.createTextNode(v.displayName));
      option.appendChild(optionTitle);
      this.tombola.appendChild(option);
      this.items.push(option);
    }
    this.mask = this.items[0].cloneNode(true);
    this.tombola.appendChild(this.mask);
    this.height = this.tombolaContainer.getBoundingClientRect().height;
    this.maxHeight = (this.items.length+1)*this.height;
    this.tombola.style.height = `${this.maxHeight}px`;
  }

  stopSpin()
  {
    if(this.pickingWinner)
    {
      return;
    }
    else
    {
    	this.button.active();
      this.pickWinner();
    }
  }

	validateOptions(options)
	{
		if(!options){this.error('setValues - requires an array of objects.'); return false;}
		if(options.length < 2){this.error('setValues - requires at least 2 objects.'); return false;}
		let err = false;
		options.map((o)=>{if(!o.value || !o.displayName){this.error('setValues - value and displayName required.'); err = true;}})
		if(err){return false;}
		return true;
	}

  setValues(options)
  {
  	if(!this.validateOptions(options) || this.spinning)return;
    this.spinning=true;
    this.setOptions(options);
    this.reset();
    this.el.classList.add('appear');
    this.accessible();
    this.spin();
    this.countdownInterval = setInterval(()=>{

    });
    if(this.autoStop)
    {
	    setTimeout(()=>{
	      if(this.winner)return;
	      this.pickWinner();
	    }, this.timeBeforeAutoStop*1000);
    }
    return new Promise((resolve, reject)=>{
      this.callback = resolve;
    });
  }

  reset()
  {
    this.pickingWinner = false;
    this.stop = false;
    this.winner = null;
    this.currentScroll = null;
    this.wait = false;
  }

  pickWinner()
  {
    this.pickingWinner = true;

    this.winner = rwxMath.randomInt(0,this.items.length-1);
    this.scrollToWinner = this.winner > this.items.length-3 ? this.winner*this.height : (this.maxHeight-this.height);
  }

  spin()
  {
    if(this.stop){
      this.el.classList.remove('appear');
      this.spinning=false;
      this.callback(this.items[this.winner].getAttribute('data-value'));
      this.button.unactive();
      this.unaccessible();
      return;
    }
    window.requestAnimationFrame(this.spin);

    let speed;
    if(this.winner != null && !this.wait)
    {
      if(!this.currentScroll)
      {
        this.currentScroll = this.tombolaContainer.scrollTop;
        this.mask.innerHTML = this.items[this.winner].innerHTML;
      }
      this.tombolaContainer.scrollTop = rwxAnimate.fromTo(this.currentScroll, this.scrollToWinner, 'rwxTombola', 'easeOutQuad', 3000, ()=>{this.stop = true;})
    }
    else
    {
      this.wait = true;
      this.tombolaContainer.scrollTop += this.speed;
      if(this.tombolaContainer.scrollTop >= this.maxHeight - this.height)
      {
        this.wait = false;
        this.tombolaContainer.scrollTop = 0;
      }
    }
  }
}

export default new rwxTombola();