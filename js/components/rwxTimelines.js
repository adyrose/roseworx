require('../../scss/components/rwxTimeline.scss');
import { rwxCore, rwxComponent } from '../rwxCore';
import {rwxAnimationChain} from '../modules/rwxAnimation';

class rwxTimelines extends rwxCore {
	constructor()
	{
		super('[rwx-timeline]');
	}

	execute(el)
	{
		return new rwxTimeline(el);
	}
}

class rwxTimeline extends rwxComponent {
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
		for(let time of this.times)
		{
			obj.sequence.push({
				complete: ()=>{time.classList.add('activated')},
				easing: 'easeInOutQuad',
				duration: 800,
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
	}

	addElements()
	{
		this.blob = document.createElement('span');
		this.blob.classList.add('rwx-timeline-blob');
		this.el.appendChild(this.blob);
		for(let time of this.times)
		{
			let b = document.createElement('span');
			b.classList.add('rwx-timeline-tracker-blob');
			time.appendChild(b);
		}
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