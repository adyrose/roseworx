import rwxAnimate from '../helpers/rwxAnimateHelpers';
import rwxMath from '../helpers/rwxMathHelpers';

import { rwxCore } from '../rwxCore';

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

  setConfig(c)
  {
  	if(!c){this.error('setConfig - requires an object'); return;}
  	if(c.stopText !== undefined){this.stopText.innerText = c.stopText;}
  	if(c.autoStop !== undefined){this.autoStop = Boolean(c.autoStop);}
  	if(c.timeBeforeAutoStop !== undefined && !isNaN(c.timeBeforeAutoStop)){this.timeBeforeAutoStop = c.timeBeforeAutoStop;}
  }

  htmlDefinition()
  {
  	this.tombola = document.createElement('div');
  	this.tombola.classList.add('rwx-tombola');
  	this.tombola.id = "rwx-tombola";
    this.tombolaBackground = document.createElement('div');
    this.tombolaBackground.classList.add('rwx-tombola-background');
    this.tombolaContainer = document.createElement('div');
    this.tombolaContainer.classList.add('rwx-tombola-container');
    this.stopNode = document.createElement('div');
    this.stopNode.classList.add('rwx-tombola-stopper');
    this.stopText = document.createElement('span');
    this.stopText.setAttribute('aria-role', 'button');
    this.stopText.appendChild(document.createTextNode("Stop"));
    this.stopNode.appendChild(this.stopText);
    this.tombolaContainer.appendChild(this.tombola);
    this.tombolaBackground.appendChild(this.tombolaContainer);
    this.tombolaBackground.appendChild(this.stopNode);
    document.body.appendChild(this.tombolaBackground);
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
  	if(!this.validateOptions(options)) return;
    if(this.spinning){return;}
    this.spinning=true;
    this.setOptions(options);
    this.reset();
    this.tombolaBackground.classList.add('appear');
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
      this.tombolaBackground.classList.remove('appear');
      this.spinning=false;
      this.callback(this.items[this.winner].getAttribute('data-value'));
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
      // let val = this.easingFunction('easeOutQuad', 'stop', 3000);
      // this.tombolaContainer.scrollTop = this.currentScroll + (this.scrollToWinner - this.currentScroll) * val;
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