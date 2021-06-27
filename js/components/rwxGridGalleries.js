require('../../scss/components/rwxGridGalleries.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

class rwxGridGalleries extends rwxCore {
	constructor()
	{
		super('[rwx-grid-gallery]', true);
    window.navigator.userAgent.indexOf("MSIE ") > 0 && document.body.classList.add('ie');
	}

	execute(el, mc)
	{
		return new rwxGridGallery(el, mc);
	}
}

class rwxGridGallery extends rwxComponent {
	constructor(el, manualControl)
	{
		super({element: el, enableScrollIntoView: !manualControl});
		this.items = [...this.el.querySelectorAll('.rwx-grid-gallery-item')];
		if(this.items.length == 0)return;
		this.createStructure();
	}

	uncommenced()
	{
		this.el.classList.remove('show');
	}

	scrolledIntoView()
	{
		this.el.classList.add('show');
		this.stopScroll();
	}

	cleanUp()
	{
		this.el.classList.remove('show');
	}

	createStructure()
	{
		this.items.map((item)=>{
			if(item.querySelector('.rwx-grid-gallery-perspective')){return}
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
			this.addElement(item, persp);
			item.appendChild(persp);
		});
	}
}

export default new rwxGridGalleries();