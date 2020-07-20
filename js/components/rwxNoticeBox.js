import { rwxCore } from '../rwxCore';

class rwxNoticeBox extends rwxCore {
	constructor()
	{
		super();
	  this.noticeBoxDelay = 5;
	  this.defaultPosition = 'bottom-left';
	  this.positions = ['top-left', 'bottom-left', 'top-right', 'bottom-right'];
	}

	execute()
	{
		this.htmlDefinition();
	}

	htmlDefinition()
	{
		this.el = document.createElement('div');
		this.el.classList.add('rwx-notice-box');
		this.el.classList.add('--bottom-left');
		this.valueEl = document.createElement('span');
		this.valueEl.classList.add('value');
		this.el.appendChild(this.valueEl);
		document.body.appendChild(this.el);
	}

	setPosition(pos)
	{
		this.positions.map((e)=>this.el.classList.remove(`--${e}`));
		this.el.classList.add(`--${pos}`);
	}

	setConfig(c)
	{
		if(!c){this.error('setConfig - requires an object'); return;}
		if(c.delay !== undefined && !isNaN(c.delay)){this.noticeBoxDelay = c.delay;}
		if(c.position !== undefined && this.positions.includes(c.position)){this.setPosition(c.position)}
	}

  setValue(text, close=false, cb=false)
  {
    clearTimeout(this.noticeBoxTimeout);
    if(text != "")
    {
      this.valueEl.innerText = text;
      this.el.classList.add('show');
    }

    if(!close && text==""){close = true;}
    if(!close){return;}

    this.noticeBoxTimeout = setTimeout(()=>{
      this.el.classList.remove('show');
      cb && cb();
    }, (this.noticeBoxDelay*1000));
  }

  close()
  {
    this.el.classList.remove('show')
  }
}

export default new rwxNoticeBox();