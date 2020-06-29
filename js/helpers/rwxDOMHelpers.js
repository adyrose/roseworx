const rwxDOM = {
	hasAncestor: (el, selector) => {
		const element = el.parentNode;
		if(element.matches('body'))
		{
			return false;
		}
		else if(element.matches(selector)){
			return element;
		}
		return rwxDOM.hasAncestor(element, selector);
	},

	slideClass: 'rwx-slide-expanded',

  slideDown: (el, duration, cb=()=>{}) => {
    if(el.offsetHeight > 0){return}
    el.removeAttribute('style');
    el.style.display = "block";
    el.style.overflow = "hidden";
    el.style.opacity = 0;
    const height = el.getBoundingClientRect().height;
    el.style.height = 0;
    el.style.transition = `all ${duration}s cubic-bezier(.13,1.06,.98,1)`;
    requestAnimationFrame(()=>{
      el.style.height = height+'px';
      el.style.opacity = 1;
      el.classList.add(rwxDOM.slideClass);
      setTimeout(cb, duration*1000);
      return;      
    });
  },

  slideUp: (el, duration, cb=()=>{}) => {
    if(el.offsetHeight <= 0){return;}
    el.removeAttribute('style');
    el.style.transition = `all ${duration}s cubic-bezier(.13,1.06,.98,1)`;
    el.style.height = el.getBoundingClientRect().height + "px";
    el.style.overflow = "hidden";
    el.style.opacity = 1;
    window.requestAnimationFrame(()=>{
      el.style.height = "0px";
      el.style.opacity = 0;
      el.classList.remove(rwxDOM.slideClass);
      setTimeout(cb, duration*1000);
      return;
    });
  },
  
  slideToggle: (el, duration, cb=()=>{}) => {
    el.offsetHeight <= 0 ? rwxDOM.slideDown(el,duration,cb) : rwxDOM.slideUp(el,duration,cb);
  }
}

export default rwxDOM;