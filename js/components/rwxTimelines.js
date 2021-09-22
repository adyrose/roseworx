import { rwxCore, rwxAnimationComponent } from '../rwxCore';
import {rwxAnimationChain} from '../modules/rwxAnimation';

class rwxTimelines extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-timeline]', canHaveManualControl:true, resource: 'rwxTimelines'});
	}

	execute(el, mc)
	{
		return new rwxTimeline(el, mc);
	}
}

class rwxTimeline extends rwxAnimationComponent {
	constructor(el, manualControl)
	{
		super({element: el, enableScrollIntoView: true, enableAnimationLoop:true});
		this.times = [...this.el.querySelectorAll('.rwx-timeline-tracker')];
		if(this.times.length === 0)return;
		this.addElements();
		this.createAnimations();
	}

	createAnimations()
	{
		let obj = {
			sequence: [],
			complete: ()=>{
				this.stopAnimation = true;
			}
		}
		let arr = [];
		for(let [index,time] of this.times.entries())
		{
			obj.sequence.push({
				complete: ()=>{time.classList.add('activated')},
				easing: 'easeInOutQuad',
				duration: index === 0 ? 800 : this.times[index-1].offsetHeight*5,
				to: ()=>time.offsetTop+14
			});
			arr.push((t)=>this.blob.style.top = `${t}px`)
		}
		obj.sequence[0].from = -14;
		obj.sequence.push({
				from:()=>this.times[this.times.length-1].offsetTop+14,
				to:()=>this.el.offsetHeight-15,
				easing: 'easeInOutQuad',
				duration: 800,
			},
			{
				from:1,
				to:0,
				easing: 'linear',
				duration: 500,				
			}
		);
		arr.push((t)=>this.blob.style.top = `${t}px`, (o)=>this.blob.style.opacity = o);
		this.fnArr = arr;
		this.blobAnimation = new rwxAnimationChain(obj);
		this.addAnimation(this.blobAnimation);
	}

	addElements()
	{
		this.blob = document.createElement('span');
		this.blob.classList.add('rwx-timeline-blob');
		this.addElement(this.el, this.blob);
		for(let time of this.times)
		{
			let b = document.createElement('span');
			b.classList.add('rwx-timeline-tracker-blob');
			this.addElement(time, b);
		}
	}

	cleanUp()
	{
		this.times.map((t)=>t.classList.remove('activated'));
	}

	scrolledIntoView()
	{
		if(this.times.length>0)this.startAnimation();
		this.stopScroll();
	}

	animate()
	{
		this.blobAnimation.animate(this.fnArr);
	}
}

export default new rwxTimelines();