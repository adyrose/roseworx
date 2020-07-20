require('../../scss/modules/rwx-animateable-border.scss');

import { rwxCore } from '../rwxCore';

class rwxAnimateableBorder {
	constructor(el)
	{
		this.target = el;
		this.target.classList.add('rwx-animateable-border');
		this.target.style.position = "relative";
		this.paddingX = 60;
		this.paddingY = 40;
		this.active = this.active.bind(this);
		this.unactive = this.unactive.bind(this);
		this.measurements();
	}

	active()
	{
		this.el.classList.add('active');
	}

	unactive()
	{
		this.el.classList.remove('active');
	}

	measurements()
	{
		let rect = this.target.getBoundingClientRect();
		let svgWidth = rect.width + this.paddingX;
		let svgHeight = rect.height + this.paddingY;
		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttributeNS(null, 'width', svgWidth);
		svg.setAttributeNS(null, 'height', svgHeight);
		svg.style.top = `-${this.paddingY/2}px`;
		svg.style.left = `-${this.paddingX/2}px`;
		let rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rectangle.setAttributeNS(null, 'width', svgWidth);
		rectangle.setAttributeNS(null, 'height', svgHeight);
		rectangle.setAttributeNS(null, 'stroke-dasharray', `${svgHeight} ${svgWidth}`);
		rectangle.setAttributeNS(null, 'stroke-dashoffset', `-${svgWidth * 2}`);
		svg.appendChild(rectangle);
		svg.addEventListener('mouseover', this.active);
		svg.addEventListener('mouseleave', this.unactive);
		this.el = svg;
		this.target.appendChild(svg);
	}
}

export default rwxAnimateableBorder;