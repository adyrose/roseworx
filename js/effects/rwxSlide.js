const rwxSlide = {
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
      el.classList.add(rwxSlide.slideClass);
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
      el.classList.remove(rwxSlide.slideClass);
      setTimeout(cb, duration*1000);
      return;
    });
  },
  
  slideToggle: (el, duration, cb=()=>{}) => {
    el.offsetHeight <= 0 ? rwxSlide.slideDown(el,duration,cb) : rwxSlide.slideUp(el,duration,cb);
  }	
};

export default rwxSlide;