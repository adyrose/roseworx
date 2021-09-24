class rwxSwipeTracking {
  constructor(el, ev) {
    this.el = el;
    this.ev = ev;
    this.swipeDistance = 100;
    this.touchstartevent = this.touchstartevent.bind(this);
    this.touchendevent = this.touchendevent.bind(this);
    this.addEvents();
  }

  addEvents() {
    this.el.addEventListener('touchstart', this.touchstartevent);
    this.el.addEventListener('touchend', this.touchendevent);
  }

  cleanUp() {
    this.el.removeEventListener('touchstart', this.touchstartevent);
    this.el.removeEventListener('touchend', this.touchendevent);
  }

  touchstartevent(e)
  {
    this.prevx = e.touches[0].clientX;
    this.prevy = e.touches[0].clientY;
  }

  touchendevent(e)
  {
    this.reportX = Math.abs(this.prevx - e.changedTouches[0].clientX) > this.swipeDistance;
    if(this.reportX)
    {
      this.ev(this.prevx < e.changedTouches[0].clientX ? 'right' : 'left', e)
    }

    this.reportY = Math.abs(this.prevy - e.changedTouches[0].clientY) > this.swipeDistance;
    if(this.reportY)
    {
      this.ev(this.prevy < e.changedTouches[0].clientY ? 'down' : 'up', e)
    }
  }
}

export default rwxSwipeTracking;