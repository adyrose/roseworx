const rwxDOM = {
	hasAncestor: (el, selector) => {
		let element = el.parentNode;
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

  slideDown: (el, time, cb=()=>{}) => {
    let animetime = time * 60 / 1000;
    el.style.display = "block";
    el.style.transition = `height ${(time/1000)/2}s ease-out`;
    let height = el.getBoundingClientRect().height;
    let increment = 0;
    el.style.height = increment;
    let speed = height / animetime * 10;
    function animate()
    {
      if(increment>height){
        el.style.height = height+'px';
        el.classList.add(rwxDom.slideClass);
        cb();
        return;}
      el.style.height = increment+'px';
      increment = increment+speed;
      requestAnimationFrame(animate);
    }
    animate();
  },

  slideUp: (el, time, cb=()=>{}) => {
    el.style.transition = `height ${(time/1000)}s ease-out`;
    el.style.height = "0px";
    setTimeout(()=>{
      el.classList.remove(rwxDom.slideClass);
      el.removeAttribute("style")
      cb();      
    }, time);
  },
  
  slideToggle: (el, time, cb=()=>{}) => {
    el.classList.contains(rwxDom.slideClass) ? this.slideUp(el,time,cb) : this.slideDown(el,time,cb);
  }
}

export default rwxDOM;