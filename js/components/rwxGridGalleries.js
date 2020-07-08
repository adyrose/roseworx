require('../../scss/components/rwxGridGalleries.scss');

import { rwxCore, rwxComponent } from '../rwxCore';
class rwxGridGalleries extends rwxCore {
	constructor()
	{
		super('[rwx-grid-gallery]');
	}

	execute(el)
	{
		return new rwxGridGallery(el);
	}
}

class rwxGridGallery extends rwxComponent {
	constructor(el)
	{
		super({enableScrollIntoView:true});
		this.el = el;
		this.items = [...this.el.querySelectorAll('.rwx-grid-gallery-item')];
		if(this.items.length == 0)return;
		this.createStructure();
	}

	scrolledIntoView()
	{
		this.el.classList.add('start');
		this.stopScroll = true;
	}

	createStructure()
	{
		this.items.map((item)=>{
			const persp = document.createElement('div');
			persp.classList.add('rwx-grid-gallery-perspective');
			const trans = document.createElement('div');
			trans.classList.add('rwx-grid-gallery-transform');
			const transface = document.createElement('div');
			transface.classList.add('rwx-grid-gallery-transform-face');
			const teaser = document.createElement('div');
			teaser.classList.add('rwx-grid-gallery-teaser');
			[...item.children].map((child)=>teaser.appendChild(child));
			transface.appendChild(teaser);
			trans.appendChild(transface);
			persp.appendChild(trans);
			item.appendChild(persp);
		});
	}
}

export default new rwxGridGalleries();