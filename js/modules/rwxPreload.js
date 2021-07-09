require('../../scss/modules/rwx-preload.scss');

import { rwxCore } from '../rwxCore';

class rwxPreload extends rwxCore {
	constructor()
	{
		super({});
	}

	execute()
	{
		window.requestAnimationFrame(()=>{
			document.body.classList.contains('rwx-preload') && document.body.classList.remove('rwx-preload');
		});
	}
}

export default new rwxPreload();