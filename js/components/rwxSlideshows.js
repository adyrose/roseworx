require('../../scss/components/rwxSlideshows.scss');

import { rwxCore, rwxComponent } from '../rwxCore';
import rwxMisc from '../helpers/rwxMiscHelpers';

class rwxSlideshows extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-slideshow]', canHaveManualControl:false, resource: 'rwxSlideshows'});
	}

	execute(el)
	{
		return new rwxSlideshow(el);
	}
}

class rwxSlideshow extends rwxComponent {
  constructor(el)
  {
    super({element: el, enableMouseTracking: true, enableResizeDebounce:true});
    this.slides = [...this.el.querySelectorAll('.slide')];
    if(this.slides.length == 0){return;}
    this.elFullSizeAbsolute();
    this.addAttribute(this.el, 'tabindex', 0);
    this.nextslide = this.nextslide.bind(this);
    this.prevslide = this.prevslide.bind(this);
    this.keyupevent = this.keyupevent.bind(this);

    this.generateHTML();
    
    this.el.addEventListener('keyup', this.keyupevent);

    this.width = this.el.getBoundingClientRect().width;

    this.backgroundColors = [
      "#84fab0", 
      "#8fd3f4", 
      "#f78ca0", 
      "#fbc2eb", 
      "#fa709a", 
      "#a6c1ee", 
      "#f9748f", 
      "#d4fc79", 
      "#96e6a1", 
      "#84fab0", 
      "#fee140", 
      "#8fd3f4", 
      "#fd868c", 
      "#fe9a8b" 
    ];

    rwxMisc.shuffleArray(this.backgroundColors);
    this.counter = 0;

    this.init();
  }

  generateHTML()
  {
    this.background = document.createElement('div');
    this.background.classList.add('rwx-slideshow-background');

    const ps = document.createElement('span');
    this.convertToButton(ps, this.prevslide);
    ps.classList.add('prev-slide');
    ps.addEventListener('click', this.prevslide);
    this.prevslidebutton = ps;

    const ns = document.createElement('span');
    this.convertToButton(ns, this.nextslide);
    ns.classList.add('next-slide');
    ns.addEventListener('click', this.nextslide);
    this.nextslidebutton = ns;

    this.slidesContainer = document.createElement('div');
    this.slidesContainer.classList.add('slide-container');

    this.slides.map((s)=>this.slidesContainer.appendChild(s));

    this.addElement(this.el, this.background);
    this.addElement(this.el, ps);
    this.addElement(this.el, ns);

    this.el.appendChild(this.slidesContainer);
  }

  moused(e)
  {
    let c = this.slideContents[this.counter];
    let halfW = c.bounds.width/2;
    let halfH = c.bounds.height/2;
    let degY = e.x>=halfW ? Math.abs(halfW-e.x) : -(halfW-e.x);
    let degX = e.y>=halfH ? halfH-e.y : Math.abs(halfH-e.y);
    if(c.content)c.content.style.transform = `rotateY(${degY/100}deg) rotateX(${degX/30}deg) translate(${degY/40}px, ${degX/30}px)`;
    if(c.title)c.title.style.transform = `rotateY(${degY/100}deg) rotateX(${degX/30}deg) translate(${degY/40}px, ${degX/30}px)`;
  }

  keyupevent(ev)
  {
    switch(ev.keyCode)
    {
      case 39:
      {
        this.nextslide();
        break;
      }
      case 37:
      {
        this.prevslide();
        break;
      }
    }   
  }

  cleanUp()
  {
    const cache = this.slides;
    this.el.removeChild(this.slidesContainer);
    cache.map((c)=>{
      c.style.transform = "";
      this.slideContents.map((sc)=>{sc.content.style.transform="";sc.title.style.transform="";return false;})
      this.el.appendChild(c);
      return false
    });
    this.el.removeEventListener('keyup', this.keyupevent);
  }

  init(firstblood=true)
  {
    if(firstblood)
    {
      this.background.style.backgroundImage = `linear-gradient(to right,${this.backgroundColors.join(',')})`;
      this.background.style.backgroundPosition = "0 0";
      this.slidesContainer.style.width = `${this.slides.length*100}%`;
      this.slideContents = [];
    }

    this.background.style.backgroundSize = `${this.backgroundColors.length*this.width}px 100%`;

    this.slides.map((slide, i)=>{
      this.addStyle(slide, 'width', `${this.width}px`);
      if(firstblood)
      {
        const content = slide.querySelector('.slide-content');
        const title = slide.querySelector('.slide-title');
        this.slideContents.push({content,title, bounds:slide.getBoundingClientRect()});
      }
      else
      {
        this.slideContents[i].bounds = slide.getBoundingClientRect();
      }
    });
  }

  nextslide()
  {
    if(this.counter<(this.slides.length-1))
    {
    	this.nextslidebutton.focus();
      this.counter++;
      this.slideInToView();
      this.background.style.backgroundPosition = `-${this.width*this.counter}px 0`;
    }
  }

  prevslide()
  {
    if(this.counter>0)
    {
    	this.prevslidebutton.focus();
      this.counter--;
      this.slideInToView();
      this.background.style.backgroundPosition = `-${this.width*this.counter}px 0`;
    }
  }

  slideInToView()
  {
  	this.slides.map((s, i)=>{
    	let scale = 0.2;
    	if(i == this.counter)
    	{
    		scale = 1;
    	}
    	s.style.transform = `translateX(${-(this.counter*100)}%) scale(${scale})`;
    	return;
  	});
  }

  resize()
  {
    this.width = this.el.getBoundingClientRect().width;
    this.init(false);
  }
}

export default new rwxSlideshows();