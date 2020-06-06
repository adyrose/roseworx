class rwxTables {
	constructor()
	{
		const tables = [...document.querySelectorAll('[rwx-table]')];
		tables.map((t)=>{
			const dual = t.classList.contains('dual-headings');
			const vertical = t.classList.contains('vertical');
			const verticalLine = t.classList.contains('vertical-line');
			const noMist = t.hasAttribute('rwx-table-no-mist');
			const noStick = t.hasAttribute('rwx-table-no-stick');

			let mist, stick;

			if(!noMist)
			{
				mist  = new rwxTableMist(t);
			}

			if(!noStick)
			{
				if(vertical)
				{
					stick = new rwxVerticalStickyTableHeader(t, 30);
				}
				else if(dual)
				{
					stick = new rwxDualStickyTableHeader(t, 30, verticalLine);
				}
				else
				{
					stick = new rwxHorizontalStickyTableHeader(t, 30);
				}
			}

			t.addEventListener('scroll', ()=>{
				!noStick && stick.update();
				!noMist && mist.update();
			});

			return;
		})
	}
}

class rwxTableMist
{
	constructor(t)
	{
		this.table = t;
		if(t.scrollWidth > t.offsetWidth){
			this.rightMist = document.createElement('div');
			this.rightMist.classList.add('right-mist');
			t.appendChild(this.rightMist);
		}
		if(t.scrollHeight > t.offsetHeight){
			this.bottomMist = document.createElement('div');
			this.bottomMist.classList.add('bottom-mist');
			t.appendChild(this.bottomMist);
		}
	}

	update()
	{
		if(this.rightMist)
		{
			if((this.table.scrollLeft + this.table.offsetWidth) < this.table.scrollWidth){
				this.rightMist.style.display = "block"; 
				this.rightMist.style.right = -this.table.scrollLeft + "px";
				this.rightMist.style.height = this.table.scrollHeight + "px";
			}
			else{this.rightMist.style.display = "none";}
		}
		if(this.bottomMist)
		{
			if((this.table.scrollTop + this.table.offsetHeight) < this.table.scrollHeight){
				this.bottomMist.style.display = "block";
				this.bottomMist.style.width = this.table.scrollWidth + "px";
				this.bottomMist.style.bottom = -this.table.scrollTop + "px";
			}
			else{this.bottomMist.style.display = "none";}
		}
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
		return this.headerEls[0].querySelector('span:first-child').getBoundingClientRect().width;
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
		this.headerEls.map((h)=>{
			let s = h.querySelector('span:first-child');
			let c = s.cloneNode(true);
			c.classList.add('scroll');
			c.style.width = s.getBoundingClientRect().width + "px";
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

export default rwxTables;