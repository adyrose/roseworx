import rwxMath from '../helpers/rwxMathHelpers';
import rwxMisc from '../helpers/rwxMiscHelpers';

import { rwxCore, rwxAnimationComponent } from '../rwxCore';
import { rwxAnimation } from '../modules/rwxAnimation';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';

class rwxLuckyDips extends rwxCore {
  constructor()
  {
    super({selector:'[rwx-lucky-dip]', canHaveManualControl:true, resource: 'rwxLuckyDips'});
    this.stopTextDefault = "Stop";
    this.timeBeforeAutoStopDefault = 10;
  }

  execute(el, mc)
  {
    const stopText = this.checkAttributeOrDefault(el, 'data-rwx-lucky-dip-stop-text', this.stopTextDefault);
    const timeBeforeAutoStop = this.checkAttributeOrDefault(el, 'data-rwx-lucky-dip-auto-stop-delay', this.timeBeforeAutoStopDefault);
    const autoStop = this.checkAttributeForBool(el, 'data-rwx-lucky-dip-auto-stop');
    return new rwxLuckyDip(el, mc, stopText, parseInt(timeBeforeAutoStop), autoStop);
  }

  onSelected(id, cb)
  {
    const IME = this.getIME(id);
    IME && IME.onSelected(cb);
  }
}

class rwxLuckyDip extends rwxAnimationComponent {
  constructor(el, manualControl, stopText, timeBeforeAutoStop, autoStop)
  {
  	super({element: el, enableScrollIntoView: !manualControl, enableAnimationLoop: true});
    this.counter = 0;
    Object.assign(this, {stopText, timeBeforeAutoStop, autoStop});
    this.speed = 13;
    this.items = [...this.el.querySelectorAll('.rwx-lucky-dip-item')];
    this.stopSpin = this.stopSpin.bind(this);
    this.elFullSizeAbsolute();
    this.htmlDefinition();
  }

  scrolledIntoView()
  {
    this.el.classList.add('active');
    this.spinning=true;
    this.reset();
    this.startAnimation();
    if(this.autoStop)
    {
      setTimeout(()=>{
        if(this.winner)return;
        this.pickWinner();
      }, this.timeBeforeAutoStop*1000);
    }
    this.stopScroll();
  }

  cleanUp()
  {
    this.el.classList.remove('active');
    this.button.cleanUp();
    this.items.map((i)=>this.el.appendChild(i));
  }

  htmlDefinition()
  {
    this.container = document.createElement('div');
    this.container.classList.add('rwx-lucky-dip-container');
    this.items.map((i)=>this.container.appendChild(i));
    this.stopNode = document.createElement('div');
    this.stopNode.classList.add('rwx-lucky-dip-stopper');
    this.stopTextNode = document.createElement('span');
    this.stopTextNode.classList.add('text');
    this.stopTextNode.innerText = this.stopText;
    this.stopNode.appendChild(this.stopTextNode);
    this.addElement(this.el, this.container);
    this.addElement(this.el, this.stopNode);
    this.stopNode.addEventListener('click', this.stopSpin);
    this.button = new rwxAnimatedBorder(this.stopNode);
    rwxMisc.convertToButton(this.stopNode, this.stopSpin);
    this.mask = this.items[0].cloneNode(true);
    this.container.appendChild(this.mask);
    this.height = this.container.getBoundingClientRect().height;
    this.maxHeight = (this.items.length+1)*this.height;
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

  onSelected(cb)
  {
    this.callback = cb;
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
    this.winnerAnimation = new rwxAnimation({
      from: this.currentScroll,
      to: this.scrollToWinner,
      easing: 'easeOutQuad',
      duration: 3000,
      complete: ()=>{
        this.el.classList.add('remove');
        this.spinning=false;
        this.callback && this.callback(this.items[this.winner].getAttribute('data-rwx-lucky-dip-value'));       
        this.stopAnimation=true;
        setTimeout(()=>{
          this.el.classList.remove('remove', 'active');
          this.addAttribute(this.el, 'aria-hidden', true);
          this.addAttribute(this.stopNode, 'tabindex', -1);
          this.addStyle(this.el, 'z-index', -1);
        }, 1000);
      }
    })
  }

  animate()
  {
    if(this.winner != null && !this.wait)
    {
      if(!this.currentScroll)
      {
        this.currentScroll = this.container.scrollTop;
        this.mask.innerHTML = this.items[this.winner].innerHTML;
      }
      this.winnerAnimation.animate((v)=>this.container.scrollTop=v)
    }
    else
    {
      this.wait = true;
      this.container.scrollTop += this.speed;
      if(this.container.scrollTop >= this.maxHeight - this.height)
      {
        this.wait = false;
        this.container.scrollTop = 0;
      }
    }
  }
}

export default new rwxLuckyDips();