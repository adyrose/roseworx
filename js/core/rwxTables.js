class rwxTables {
	constructor()
	{
		//sticky header correct direction
		//sticky gradient
		const tables = [...document.querySelectorAll('[rwx-table]')];
		tables.map((t)=>{

			if(t.classList.contains('dual-headings')){return;}
			const vertical = t.classList.contains('vertical');

			// const toStick = vertical ? [...t.querySelectorAll('.rwx-table-data:first-child span')] : [...t.querySelectorAll('.rwx-table-data span:first-child')];
			// const toMargin = vertical ? [...t.querySelectorAll('.rwx-table-data:nth-child(2) span')] : [...t.querySelectorAll('.rwx-table-data span:nth-child(2)')];

			// const heights = [];
			// const widths = [];
			// const tMeasurements = t.getBoundingClientRect();
			// let topMax, leftMax;

			// toStick.map((ts, index)=>{
			// 	let measurements = ts.getBoundingClientRect();
			// 	let left = measurements.left;
			// 	vertical && console.log(left);

			// 	if(index==0)
			// 	{
			// 		//if rwx-table has padding to the left or top need to factor it in to the scroll (e.g direct child of grid it gets padding left and right)
			// 		leftMax = (measurements.left - tMeasurements.left); 
			// 		topMax =(measurements.top - tMeasurements.top);
			// 	}
			// 	vertical ? heights.push(measurements.height) : widths.push(measurements.width);

			// 	if(vertical)
			// 	{
			// 		//ts.style.left = measurements.left + "px";
			// 	}
			// 	else
			// 	{
			// 		ts.parentNode.style.height = measurements.height + "px";
			// 		ts.style.width = measurements.width + "px";					
			// 	}

			// 	ts.style.top = vertical ? topMax : (measurements.top-tMeasurements.top)+"px";

			// 	//ts.style.position = "absolute";
			// 	return;
			// });

			// const max = vertical ? Math.max( ...heights ) : Math.max(...widths);

			// vertical && toStick.map((ts)=>ts.style.height = max+"px");
			// toMargin.map((tm)=>{
			// 	if(vertical)
			// 	{
			// 		tm.style.marginTop = max-2+"px";
			// 	}
			// 	else
			// 	{
			// 		tm.style.marginLeft = max + "px";
			// 	}
			// 	return;
			// });

			if(vertical)
				{
				const stick = new rwxVerticalStickyTableHeader(t);
				t.addEventListener('scroll', ()=>{
					stick.update();
				})
			}

			return;
		})
	}

}

class rwxVerticalStickyTableHeader
{
	constructor(tableEl)
	{
		this.headerStuck = false;
		this.topMin = 0; // needs to factor in padding top by getting top of header clone and top of table and minusing
		this.boundary = (10+this.topMin);
		this.table = tableEl;
		this.headerEl = tableEl.querySelector('.rwx-table-data:first-child');
		this.stuckElement = false;
		// tableEl.addEventListener('scroll', ()=>{
		// 	if(t.scrollTop > this.boundary){
		// 		if(!this.headerStuck){this.makeHeaderSticky(); this.headerStuck = true;}
		// 		else{this.stuckElement.style.top = t.scrollTop + "px"}
		// 	}
		// 	else{
		// 		if(this.headerStuck){this.makeHeaderNormal(); this.headerStuck = false;}
		// 		{this.stuckElement.style.top = this.topMin + "px"}
		// 	};

			// let param = vertical ? "scrollTop" : "scrollLeft";
			// let direction = vertical ? 'top' : 'left';
			// let boundary = vertical ? (10+topMax) : (10+leftMax);
			// let max = vertical ? topMax : leftMax;
			// toStick.map((ts)=>{
			// 	if(t[param] > boundary){
			// 		if(!this.headerStuck){this.makeHeaderSticky(); this.headerStuck = true;}
			// 		ts.classList.add('scroll');
			// 		ts.style[direction] = t[param] + "px";
			// 	}
			// 	else{
			// 		if(this.headerStuck){this.makeHeaderNormal(); this.headerStuck = false;}
			// 		ts.classList.remove('scroll');
			// 		ts.style[direction] = max + "px";
			// 	};
			// });
		//});
	}

	update()
	{
		if(this.table.scrollTop > this.boundary){
			if(!this.headerStuck){this.makeHeaderSticky(); this.headerStuck = true;}
			else{if(this.stuckElement)this.stuckElement.style.top = this.table.scrollTop + "px"}
		}
		else{
			if(this.headerStuck){this.makeHeaderNormal(); this.headerStuck = false;}
			{if(this.stuckElement)this.stuckElement.style.top = this.topMin + "px"}
		};
	}

	makeHeaderSticky()
	{
		this.stuckElement = this.headerEl.cloneNode(true);
		this.table.appendChild(this.stuckElement);
		this.stuckElement.classList.add('scroll');
	}

	makeHeaderNormal()
	{
		this.table.removeChild(this.stuckElement);
	}
}

export default rwxTables;