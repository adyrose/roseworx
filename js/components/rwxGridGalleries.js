require('../../scss/components/rwxGridGalleries.scss');
import { rwxCore, rwxComponent } from '../rwxCore';

class rwxGridGalleries extends rwxCore {
	constructor()
	{
		super({selector:'[rwx-grid-gallery]', canHaveManualControl:true});
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
		this.cachedChildren = this.items.map((i)=>[...i.children]);
		if(this.items.length == 0)return;
		this.createStructure();
	}

	scrolledIntoView()
	{
		this.el.classList.add('show');
		this.stopScroll();
	}

	cleanUp()
	{
		this.el.classList.remove('show');
		this.items.map((i, ind)=>this.cachedChildren[ind].map((ii)=>i.appendChild(ii)));
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
		});
	}
}

export default new rwxGridGalleries();