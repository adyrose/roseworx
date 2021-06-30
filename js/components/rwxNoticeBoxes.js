import { rwxCore, rwxComponent } from '../rwxCore';

class rwxNoticeBoxes extends rwxCore {
	constructor()
	{
		super('[rwx-notice-box]', false);
		this.autoCloseDelayDefault = 5;
	}

  execute(el)
  {
  	let autoCloseDelay = this.checkAttributeOrDefault(el, 'data-rwx-notice-box-auto-close-delay', this.autoCloseDelayDefault);
    return new rwxNoticeBox(el, autoCloseDelay);
  }

  notify(id, autoClose, cb)
  {
    const IME = this.getIME(id);
    IME && IME.notify(autoClose, cb);
  }

  unnotify(id)
  {
    const IME = this.getIME(id);
    IME && IME.unnotify();  	
  }
}

class rwxNoticeBox extends rwxComponent {
	constructor(el, autoCloseDelay)
	{
		super({element:el});
	  this.noticeBoxDelay = autoCloseDelay;
	  this.el.parentNode.style.overflow = "hidden";
	}

	cleanUp()
	{
		this.el.parentNode.style.overflow = '';
		this.el.classList.remove('show', 'hide');
	}

  notify(autoClose=false, cb=false)
  {
    clearTimeout(this.noticeBoxTimeout);
    this.el.classList.add('show');
    if(!autoClose){return;}

    this.noticeBoxTimeout = setTimeout(()=>{
      this.unnotify();
      cb && cb();
    }, (this.noticeBoxDelay*1000));
  }

  unnotify()
  {
  	if(!this.el.classList.contains('show')){return;}
  	this.el.classList.add('hide');
  	setTimeout(()=>{
  		this.el.classList.remove('show', 'hide');
  	}, 1300);
  }
}

export default new rwxNoticeBoxes();