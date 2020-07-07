import { rwxCore } from '../rwxCore';
import rwxMist from '../common/rwxMist';

class rwxTables extends rwxCore {
	constructor()
	{
		super('[rwx-table]');
	}
	
	execute(el)
	{
		const dual = el.classList.contains('dual-headings');
		const vertical = el.classList.contains('vertical');
		const verticalLine = el.classList.contains('vertical-line');
		const noMist = el.hasAttribute('data-rwx-table-no-mist');
		const noStick = el.hasAttribute('data-rwx-table-no-stick');

		let mist, stick;

		if(!noMist)
		{
			mist  = new rwxMist(el);
		}

		if(!noStick)
		{
			if(vertical)
			{
				stick = new rwxVerticalStickyTableHeader(el, 30);
			}
			else if(dual)
			{
				stick = new rwxDualStickyTableHeader(el, 30, verticalLine);
			}
			else
			{
				stick = new rwxHorizontalStickyTableHeader(el, 30);
			}
		}

		el.addEventListener('scroll', ()=>{
			!noStick && stick.update();
		});
		return stick;

	}
}

class rwxDualStickyTableHeader
{
	constructor(t, scrollBoundary, isVerticalLine)
	{
		this.table = t;
		this.isVerticalLine = isVerticalLine;
		this.stick = new rwxVerticalStickyTableHeader(t, scrollBoundary);
		this.stick2 = new rwxHorizontalStickyTableHeader(t, scrollBoundary);
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
		this.table.appendChild(mask);
		this.maskCreated = true;
	}

	destroyMask()
	{
		this.table.removeChild(this.mask);
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
					this.mask.style.left = this.table.scrollLeft + "px";
				}
				if(this.stick2.headerStuck)
				{
					this.mask.style.top = this.table.scrollTop + "px";
				}
			}
		}
		else
		{
			if(this.maskCreated)this.destroyMask();
		}
	}
}

class rwxVerticalStickyTableHeader
{
	constructor(tableEl, scrollBoundary)
	{
		this.table = tableEl;
		this.tableBoundaries = this.table.getBoundingClientRect();
		this.stuckElements = [];
		this.headerStuck = false;
		this.headerEls = [...tableEl.querySelectorAll('.rwx-table-data')];
		this.leftMin = this.headerEls[0].getBoundingClientRect().left - this.tableBoundaries.left;
		this.boundary = (scrollBoundary+this.leftMin);
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
		})
		return Math.max(...widths);
	}

	update()
	{
		if(this.table.scrollLeft > this.boundary)
		{
			!this.headerStuck && this.makeHeaderSticky();
			if(this.stuckElements.length>0){this.stuckElements.map((se)=>{se.style.left = this.table.scrollLeft + "px"})}
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
			h.appendChild(c);
			return;
		});
		this.headerStuck = true;
	}

	makeHeaderNormal()
	{
		this.stuckElements.map((se,i)=>this.headerEls[i].removeChild(se));
		this.headerStuck = false;
	}
}

class rwxHorizontalStickyTableHeader
{
	constructor(tableEl, scrollBoundary)
	{
		this.table = tableEl;
		this.tableBoundaries = this.table.getBoundingClientRect();
		this.stuckElement = false;
		this.headerStuck = false;
		this.headerEl = tableEl.querySelector('.rwx-table-data:first-child');
		this.topMin = this.headerEl.getBoundingClientRect().top - this.tableBoundaries.top;
		this.boundary = (scrollBoundary+this.topMin);
	}

	getHeight()
	{
		return this.headerEl.getBoundingClientRect().height;
	}

	update()
	{
		if(this.table.scrollTop > this.boundary){
			!this.headerStuck && this.makeHeaderSticky();
			if(this.stuckElement)this.stuckElement.style.top = this.table.scrollTop + "px"
		}
		else
		{
			this.headerStuck && this.makeHeaderNormal();
		};
	}

	makeHeaderSticky()
	{
		this.stuckElement = this.headerEl.cloneNode(true);
		this.table.appendChild(this.stuckElement);
		this.stuckElement.classList.add('scroll');
		this.stuckElement.style.width = this.headerEl.scrollWidth + "px";
		this.headerStuck = true;
	}

	makeHeaderNormal()
	{
		this.table.removeChild(this.stuckElement);
		this.headerStuck = false;
	}
}

export default new rwxTables();