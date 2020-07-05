require('../../scss/components/rwxSlideshow.scss');

import Roseworx from '../rwxCore';
import rwxMisc from '../helpers/rwxMiscHelpers';

class rwxSlideshows extends Roseworx.Core {
	constructor()
	{
		super();
	}

	execute()
	{
		const slideshows = [...document.querySelectorAll('[rwx-slideshow]')];
		slideshows.map((s)=>{
			const Slideshow = new rwxSlideshow(s);
		 	return;
		});
	}
}

class rwxSlideshow {
  constructor(ss)
  {
    this.slideshow = ss;
    this.slides = [...this.slideshow.querySelectorAll('.slide')];
    if(this.slides.length == 0){return;}

    this.nextslide = this.nextslide.bind(this);
    this.prevslide = this.prevslide.bind(this);
    this.addEventListeners = this.addEventListeners.bind(this);
    this.generateHTML();
    this.addEventListeners();

    this.width = this.slideshow.getBoundingClientRect().width;

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


     const ps = document.createElement('button');
     ps.classList.add('no-styles')
     ps.classList.add('prev-slide');
     ps.addEventListener('click', this.prevslide);
     this.prevslidebutton = ps;

     const ns = document.createElement('button');
     ns.classList.add('next-slide');
     ns.classList.add('no-styles');
     ns.addEventListener('click', this.nextslide);
     this.nextslidebutton = ns;

     this.slidesContainer = document.createElement('div');
     this.slidesContainer.classList.add('slide-container');

     this.slides.map((s)=>this.slidesContainer.appendChild(s));

     this.slideshow.appendChild(this.background);
     this.slideshow.appendChild(ps);
     this.slideshow.appendChild(ns);
     this.slideshow.appendChild(this.slidesContainer);

  }

  addEventListeners()
  {   
    document.body.addEventListener('keyup', (ev) => {
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
    });
  }

  init()
  {
    this.background.style.backgroundImage = `linear-gradient(to right,${this.backgroundColors.join(',')})`;
    this.background.style.backgroundSize = `${this.backgroundColors.length*this.width}px 100%`;
    this.background.style.backgroundPosition = "0 0";
    this.slidesContainer.style.width = `${this.slides.length*100}%`;
    this.slides.map((slide)=>{
      slide.style.width = `${this.width}px`;
      let content = slide.querySelector('.slide-content');
      let title = slide.querySelector('.slide-title');
      slide.addEventListener('mousemove', function(e){
        let rect = slide.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        let halfW = width/2;
        let halfH = height/2;
        let degY = e.x>=halfW ? Math.abs(halfW-e.x) : -(halfW-e.x);
        let degX = e.y>=halfH ? halfH-e.y : Math.abs(halfH-e.y);
        content.style.transform = `rotateY(${degY/100}deg) rotateX(${degX/30}deg) translate(${degY/40}px, ${degX/30}px)`;
        title.style.transform = `rotateY(${degY/100}deg) rotateX(${degX/30}deg) translate(${degY/40}px, ${degX/30}px)`;
      });
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
}

export default new rwxSlideshows();