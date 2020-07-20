import { rwxCore } from '../rwxCore';

class rwxDuoSelector extends rwxCore {
	constructor()
	{
		super();
		this.svgPaddingX = 60;
		this.svgPaddingY = 40;
		this.items = [];
	}

	execute()
	{
		this.htmlDefinition();
	}

	htmlDefinition()
	{
		this.el = document.createElement('div');
		this.el.classList.add('rwx-duo-selector');
		this.el.id = 'rwx-duo-selector';
		document.body.appendChild(this.el);
	}

	selected(val)
	{
		this.callback(val);
		this.items.map(dpi=>dpi.classList.add('remove'));
		setTimeout(()=>{
			this.el.innerHTML = "";
			this.items = [];
			this.el.classList.remove('active');
		}, 1000);
	}

	validateOptions(options)
	{
		if(!options){this.error('setValues - requires an array of objects.'); return false;}
		if(options.length < 2){this.error('setValues - requires at least 2 objects.'); return false;}
		if(options.length > 2){this.error('setValues - only accepts 2 objects, using first 2.');}
		if(!options[0].value || !options[0].displayName || !options[1].value || !options[1].displayName){this.error('setValues - value and displayName required.'); return false;}
		return true;
	}

	setValues(options)
	{
		if(!this.validateOptions(options)) return;
		options = options.slice(0,2);
		let btns = [];
		let el, btn, btnText;
		this.el.classList.add('active');
		for(let item of options)
		{
			el = document.createElement('div');
			el.classList.add('rwx-duo-selector-item');
			btn = document.createElement('div');
			btn.classList.add('rwx-duo-selector-item-button');
			btnText = document.createElement('span');
			btnText.innerText = item.displayName;
			btnText.classList.add('text');
			btn.addEventListener('click', ()=>{this.selected(item.value)});
			btn.appendChild(btnText);
			el.appendChild(btn);
			btns.push(btn);
			this.items.push(el);
			this.el.appendChild(el);
		}
		this.createSVGS(btns);
		return new Promise((resolve, reject)=>{this.callback = resolve;})
	}

	createSVGS(btns)
	{
		window.requestAnimationFrame(()=>{
			btns.map((b)=>{
				let rect = b.getBoundingClientRect();
				let svgWidth = rect.width + this.svgPaddingX;
				let svgHeight = rect.height + this.svgPaddingY;
				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttributeNS(null, 'width', svgWidth);
				svg.setAttributeNS(null, 'height', svgHeight);
				svg.style.top = `-${this.svgPaddingY/2}px`;
				svg.style.left = `-${this.svgPaddingX/2}px`;
				let rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				rectangle.classList.add('shape');
				rectangle.setAttributeNS(null, 'width', svgWidth);
				rectangle.setAttributeNS(null, 'height', svgHeight);
				rectangle.setAttributeNS(null, 'stroke-dasharray', `${svgHeight} ${svgWidth}`);
				rectangle.setAttributeNS(null, 'stroke-dashoffset', `-${svgWidth * 2}`);
				svg.appendChild(rectangle);
				b.appendChild(svg);
				return;
			});
		});
	}

	createButtonDefinition(width, height)
	{
		return `
			<svg height="${height}" width="${width}" xmlns="http://www.w3.org/2000/svg">
				<rect class="shape" height="${height}" width="${width}" />
			</svg>
		`;
	}
}

export default new rwxDuoSelector();