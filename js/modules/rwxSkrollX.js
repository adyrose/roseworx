require('../../scss/modules/rwxSkrollX.scss');
import { rwxCore, rwxComponent, rwxEnhancedComponent } from '../rwxCore';
import { rwxAnimation } from './rwxAnimation';

class rwxSkrollX extends rwxCore {
	constructor()
	{
		super({selector:'[rwxsx],[rwxpx]', canHaveManualControl:false, autoClass:false, resource: 'rwxSkrollX'});
		this.defaultDirection = "up";
		this.defaultParallaxSpeed = 10;
		this.defaultTrigger = 200;
		this.defaultDelay = 0;
		this.allowedDirections = ['up', 'down', 'left', 'right'];
	}

	execute(el)
	{
		const trigger = this.checkAttributeOrDefault(el, 'data-rwxsx-trigger', this.defaultTrigger);
		const delay = this.checkAttributeOrDefault(el, 'data-rwxsx-delay', this.defaultDelay);
		
		let direction = this.checkAttributeOrDefault(el, 'data-rwxpx-direction', this.defaultDirection);
		if(!this.allowedDirections.includes(direction))
		{
			this.error(`${direction} is not an accepted direction. Value must be one of ${this.allowedDirections.join(", ")}`);
			direction = this.defaultDirection;
		}
		
		const speed = this.checkAttributeOrDefault(el, 'data-rwxpx-speed', this.defaultParallaxSpeed);
		
		const parallax = this.checkAttributeForBool(el, 'rwxpx');
		return parallax ? new rwxParallaxItem(el, direction, speed) : new rwxSkrollXItem(el, trigger, delay, parallax);
	}
}

class rwxParallaxItem extends rwxEnhancedComponent {
	constructor(el, direction, speed)
	{
		super({element: el, enableScrollTracking: true});
		this.parallaxMultiplier = parseInt(speed);
		this.direction = direction;
		this.isX = this.isItX();
		this.isReverse = this.isItReverse();
	}

	cleanUp()
	{
		this.el.style.transform = "";
	}

	isItX()
	{
		return (this.direction === "left" || this.direction === "right");
	}

	isItReverse()
	{
		return (this.direction === "left" || this.direction === "up");
	}

	scroll()
	{
		const bounds = this.el.getBoundingClientRect();
		let inView = ((window.innerHeight-bounds.top)>0 && (bounds.top+bounds.height)>0);
		if(!inView)return;
		let val = ((((window.innerHeight/2)-(bounds.top+(bounds.height/2)))*(this.isReverse ? -1 : 1))/this.parallaxMultiplier);
		this.el.style.transform = `translate3d(${this.isX ? val : 0}px, ${!this.isX ? val : 0}px, 0px)`;
	}
}

class rwxSkrollXItem extends rwxComponent {
	constructor(el, trigger, delay)
	{
		super({element:el, enableScrollIntoView: true});
		trigger && this.setScrollTrigger(trigger);
		this.elastic = this.el.classList.contains('--elastic');
		this.elastic && this.createElasticity();
		this.delay = delay;
		this.doneFlag = 'rwxsx-end';
	}

	createElasticity()
	{
		this.animate = this.animate.bind(this);
		const parsedMatrix = window.getComputedStyle(this.el).transform.replace('matrix(', '').replace(')','').split(',');
		let tx = parsedMatrix[4].trim();
		let ty = parsedMatrix[5].trim();
		this.elasticity = new rwxAnimation({
			from: [parseFloat(tx), parseFloat(ty), 0],
			to: [0, 0, 1],
			easing: ['easeInElasticFriction', 'easeInElasticFriction', 'linear'],
			duration: 1000,
			complete: () => {
				this.el.style.transform = "";
				this.el.style.opacity = "";
				this.el.classList.add(this.doneFlag);
				this.stopAnimation = true
			}
		});
	}

	cleanUp()
	{
		this.el.classList.remove(this.doneFlag);
	}

	animate()
	{
		if(this.stopAnimation)return;
		this.elasticity.animate((x, y, o)=>{
			this.el.style.transform = `translate(${x}px, ${y}px)`;
			this.el.style.opacity = o;
		})
		window.requestAnimationFrame(this.animate);
	}

	determineAnimateOrCSS()
	{
		if(this.elastic)
		{
			this.animate();
		}
		else
		{
			this.el.classList.add(this.doneFlag);
		}
	}

	scrolledIntoView()
	{
		if(this.delay)
		{
			setTimeout(()=>this.determineAnimateOrCSS(), this.delay*1000);
		}
		else
		{
			this.determineAnimateOrCSS();
		}
		this.stopScroll();
	}
}

export default new rwxSkrollX();