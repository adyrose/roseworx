import { rwxCore, rwxComponent } from '../rwxCore';
import rwxMist from '../common/rwxMist';

class rwxTables extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-table]', canHaveManualControl:false, autoClass:false, resource: 'rwxTables'});
	}
	
	execute(el)
	{
		const dual = el.classList.contains('--dual-headings');
		const vertical = el.classList.contains('--vertical');
		const verticalLine = el.classList.contains('--vertical-line');

		const noMist = this.checkAttributeForBool(el, 'data-rwx-table-no-mist');
		const noStick = this.checkAttributeForBool(el, 'data-rwx-table-no-stick');

		let mist, stick;

		if([...el.querySelectorAll('.rwx-table-data')].length===0){return false}

		if(!noMist)
		{
			mist  = new rwxMist(el);
		}

		if(!noStick)
		{
			if(vertical)
			{
				stick = new rwxVerticalStickyTableHeader(el, 30, noStick, mist);
			}
			else if(dual)
			{
				stick = new rwxDualStickyTableHeader(el, 30, verticalLine, noStick, mist);
			}
			else
			{
				stick = new rwxHorizontalStickyTableHeader(el, 30, noStick, mist);
			}
		}
		return stick || mist || false;
	}
}

class rwxDualStickyTableHeader extends rwxComponent
{
	constructor(el, scrollBoundary, isVerticalLine, noStick, mist)
	{
		super({element: el})
		this.mist = mist;
		this.isVerticalLine = isVerticalLine;
		this.stick = new rwxVerticalStickyTableHeader(this.el, scrollBoundary);
		this.stick2 = new rwxHorizontalStickyTableHeader(this.el, scrollBoundary);
		this.update = this.update.bind(this);
		this.noStick = noStick;
		!this.noStick && this.el.addEventListener('scroll', this.update);
	}

	cleanUp() {
		if(this.mist)
		{
			this.mist.removeElements();
			this.mist.cleanUp();
		}
		this.stick.cleanUp();
		this.stick.removeElements();
		this.stick2.cleanUp();
		this.stick2.removeElements();
		!this.noStick && this.el.removeEventListener('scroll', this.update);
	}

	createMask()
	{
		let mask = document.createElement('span');
		mask.classList.add('scroll');
		mask.classList.add(this.isVerticalLine ? 'scroll-mask-vertical':'scroll-mask')
		mask.style.height = this.stick2.getHeight() + "px";
		mask.style.width = this.stick.getWidth() + "px";
		mask.style.minWidth = 0 + "px";
		this.mask = mask;
		this.addElement(this.el, mask);
		this.maskCreated = true;
	}

	destroyMask()
	{
		this.removeElement(this.el, this.mask);
		this.maskCreated = false;
	}

	update()
	{
		this.stick.update();
		this.stick2.update();

		if(this.stick.headerStuck && this.stick2.headerStuck)
		{
			if(!this.maskCreated){this.createMask();}
			else
			{
				if(this.stick.headerStuck)
				{
					this.mask.style.left = this.el.scrollLeft + "px";
				}
				if(this.stick2.headerStuck)
				{
					this.mask.style.top = this.el.scrollTop + "px";
				}
			}
		}
		else
		{
			if(this.maskCreated)this.destroyMask();
		}
	}
}

class rwxVerticalStickyTableHeader extends rwxComponent
{
	constructor(el, scrollBoundary, noStick, mist)
	{
		super({element: el});
		this.mist = mist;
		this.tableBoundaries = this.el.getBoundingClientRect();
		this.stuckElements = [];
		this.headerStuck = false;
		this.headerEls = [...this.el.querySelectorAll('.rwx-table-data')];
		this.leftMin = this.headerEls[0].getBoundingClientRect().left - this.tableBoundaries.left;
		this.boundary = (scrollBoundary+this.leftMin);
		this.update = this.update.bind(this);
		this.noStick = noStick;
		!this.noStick && this.el.addEventListener('scroll', this.update);
	}

	cleanUp()
	{
		if(this.mist)
		{
			this.mist.removeElements();
			this.mist.cleanUp();
		}
		!this.noStick && this.el.removeEventListener('scroll', this.update);
	}

	getWidth()
	{
		let widths = [];
		this.headerEls.map((el)=>{
			let e = el.querySelector('span:first-child');
			let extra = parseInt(getComputedStyle(e)['padding-left'].replace('px', '')) + parseInt(getComputedStyle(e)['padding-right'].replace('px', ''));
			let el2 = e.cloneNode(true);
			document.body.appendChild(el2)
			widths.push(el2.getBoundingClientRect().width + extra + 4);
			document.body.removeChild(el2);
			return;
		});
		return Math.max(...widths) > 150 ? 150 : Math.max(...widths);
		//return Math.max(...widths);
	}

	update()
	{
		if(this.el.scrollLeft > this.boundary)
		{
			!this.headerStuck && this.makeHeaderSticky();
			if(this.stuckElements.length>0){this.stuckElements.map((se)=>{se.style.left = this.el.scrollLeft + "px"})}
		}
		else
		{
			this.headerStuck && this.makeHeaderNormal();
		}
	}

	makeHeaderSticky()
	{
		this.stuckElements = [];
		let width = this.getWidth();

		this.headerEls.map((h)=>{
			let s = h.querySelector('span:first-child');
			let c = s.cloneNode(true);
			c.style.minWidth = 0 + "px";
			c.style.width = width + "px";
			c.classList.add('scroll');
			c.style.height = s.getBoundingClientRect().height + "px";
			this.stuckElements.push(c);
			this.addElement(h, c);
			return;
		});
		this.headerStuck = true;
	}

	makeHeaderNormal()
	{
		this.stuckElements.map((se,i)=>this.removeElement(this.headerEls[i], se));
		this.headerStuck = false;
	}
}

class rwxHorizontalStickyTableHeader extends rwxComponent
{
	constructor(el, scrollBoundary, noStick, mist)
	{
		super({element: el});
		this.mist = mist;
		this.tableBoundaries = this.el.getBoundingClientRect();
		this.stuckElement = false;
		this.headerStuck = false;
		this.headerEl = this.el.querySelector('.rwx-table-data:first-child');
		this.topMin = this.headerEl.getBoundingClientRect().top - this.tableBoundaries.top;
		this.boundary = (scrollBoundary+this.topMin);
		this.update = this.update.bind(this);
		this.noStick = noStick;
		!this.noStick && this.el.addEventListener('scroll', this.update);
	}

	cleanUp()
	{
		if(this.mist)
		{
			this.mist.removeElements();
			this.mist.cleanUp();
		}
		!this.noStick && this.el.removeEventListener('scroll', this.update);
	}

	getHeight()
	{
		return this.headerEl.getBoundingClientRect().height;
	}

	update()
	{
		if(this.el.scrollTop > this.boundary){
			!this.headerStuck && this.makeHeaderSticky();
			if(this.stuckElement)this.stuckElement.style.top = this.el.scrollTop + "px"
		}
		else
		{
			this.headerStuck && this.makeHeaderNormal();
		};
	}

	makeHeaderSticky()
	{
		this.stuckElement = this.headerEl.cloneNode(true);
		this.stuckElement.classList.add('scroll');
		this.stuckElement.style.width = this.headerEl.scrollWidth + "px";
		this.addElement(this.el, this.stuckElement);
		this.headerStuck = true;
	}

	makeHeaderNormal()
	{
		this.removeElement(this.el, this.stuckElement);
		this.headerStuck = false;
	}
}

export default new rwxTables();