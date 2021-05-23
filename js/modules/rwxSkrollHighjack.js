import {rwxAnimation} from './rwxAnimation';
import rwxScrollTrack from '../common/rwxScrollTracking';

class rwxSkrollHighjack {
	constructor(fn, m, i)
	{
		this.m = m;
		this.index = 0;
		this.fn = fn;
		this.highjacked = false;
		this.stopAnimation = false;
		this.createAnimation();
		document.body.style.overflow = "hidden";
		this.clonedEvents = [...window.rwx.scrollTracking.events];
		window.rwx.scrollTracking.events = [];
		this.animate = this.animate.bind(this);
		this.ignore = i;
		this.immediate();
		rwxScrollTrack.add((e)=>this.scrolling(e), 'rwxScrollHighjacking');
		window.addEventListener('beforeunload', ()=>{window.scrollTo(0,0)});
	}

	animate()
	{
		if(!this.highjacked)return;
		this.animation.animate((y)=>{
			window.scrollTo(0, y);
			window.scrollY = y;
			this.fn && this.fn(y);
			this.clonedEvents.map((ev)=>ev.ev());
		})
		window.requestAnimationFrame(this.animate);
	}

	goto(t)
	{
		this.animation.reset();
		const newIndex = this.m.findIndex((m)=>m.scrollto.id===t.replace('#',''));
		this.index = newIndex+1;
		this.highjacked = true;
		this.animate();
	}

	immediate()
	{
		if(window.location.hash)
		{
			const touse = window.location.hash.replace('#', '');
			const filtered = this.m.filter((m)=>m.scrollto.id===touse);
			if(filtered.length > 0)
			{
				const newIndex = this.m.findIndex((m)=>m.scrollto.id===touse);
				const newTop = filtered[0].scrollto.getBoundingClientRect().top;
				this.index = newIndex+1;
				window.requestAnimationFrame(()=>{
					window.scrollTo(0, newTop);
					window.scrollY = newTop;
					this.fn && this.fn(newTop);
					this.clonedEvents.map((ev)=>ev.ev());	
				})		
			}
		}
	}

	getTop()
	{
		if(this.index===0)return 0;
		return typeof this.m[this.index-1].scrollto === "function" ? this.m[this.index-1].scrollto() : (window.scrollY + this.m[this.index-1].scrollto.getBoundingClientRect().top)
	}

	createAnimation()
	{
		this.animation = new rwxAnimation({
			from:()=>window.scrollY,
			to: ()=>this.getTop(),
			easing: 'easeOutQuad',
			duration: 1000,
			complete: ()=>{this.highjacked=false;}
		})
	}

	scrolling(e)
	{
		if(this.highjacked || (e.type!=="wheel" && e.type !=="touchmove")){return}
		let toreturn = false;
		this.ignore.filter((sc)=>sc.scrollHeight > sc.offsetHeight).map((i)=>{
			if(e.target === i || i.contains(e.target))
			{
				toreturn=true;
			}
			return false;
		})
		if(toreturn)return;

		this.animation.reset();
		if(e.type === "wheel")
		{
			if(event.deltaY < 0)
			{
				if(this.index===0){return;}
				this.index -=1;
			}
			else if(event.deltaY > 0)
			{
				if(this.index===this.m.length){return;}
				this.index +=1;
			}
		}
		else if(e.type === "touchmove")
		{
     	let currentY = e.touches[0].clientY;
	     if(currentY > this.lastY)
	     {
					if(this.index===0){return;}
					this.index -=1;
	     }
	     else if(currentY < this.lastY)
	     {
					if(this.index===this.m.length){return;}
					this.index +=1;
	     }
	     if(this.lastY === undefined)
	     {
	     	  this.lastY = currentY;
	     	  return;
	     }
	     this.lastY = currentY;
		}
		this.highjacked = true;
		this.animate();
	}
}

export default rwxSkrollHighjack;